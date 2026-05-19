import { useAuthStore } from '@/store/authStore';

export type WebSocketEvent =
  | { type: 'quiz_completed'; data: { quiz_id: string; score: number; user_id: string } }
  | { type: 'goal_progress'; data: { goal_id: string; progress: number; user_id: string } }
  | { type: 'material_uploaded'; data: { material_id: string; name: string; user_id: string } }
  | { type: 'sync'; data: unknown }
  | { type: 'update'; data: unknown }
  | { type: 'connection'; data: { status: 'connected' | 'disconnected' | 'error' } };

export type EventHandler = (event: WebSocketEvent) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  private url: string;
  private isIntentionallyClosed = false;
  private lastToken: string | null = null;
  private connectionStartTime: number = 0;
  private hasEverConnected = false;
  private lastErrorLog = 0;

  constructor() {
    this.url = '';
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    // Use env variable if available, otherwise derive from current host
    const envUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (envUrl) {
      return envUrl;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    return `${protocol}//${window.location.hostname}:${wsPort}/api/v1/ws`;
  }

  connect() {
    if (typeof window === 'undefined') {
      return;
    }

    // Debounce: clear any pending connect
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }

    // Delay connect slightly to handle React StrictMode double-mount
    this.connectTimeout = setTimeout(() => {
      this.doConnect();
    }, 50);
  }

  private doConnect() {
    if (!this.url) {
      this.url = this.getWebSocketUrl();
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const token = useAuthStore.getState().accessToken;

    // Don't connect if no token
    if (!token) {
      return;
    }

    // Check if token is expired before connecting
    const { isTokenExpired } = useAuthStore.getState();
    if (isTokenExpired()) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.lastToken = token;
    this.connectionStartTime = Date.now();

    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;

      this.ws = new WebSocket(wsUrl);

      // Set a connection timeout so we don't hang forever if server is down
      this.connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          this.ws = null;
          this.handleConnectionFailure('Connection timeout — backend may be unavailable');
        }
      }, 5000);

      this.ws.onopen = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.hasEverConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
        this.notifyHandlers({
          type: 'connection',
          data: { status: 'connected' },
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'pong') {
            return;
          }

          this.notifyHandlers(message as WebSocketEvent);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = () => {
        // Connection error — onclose will handle cleanup
        // Only log if we've connected before, to avoid spam when backend is down
        if (this.hasEverConnected) {
          this.throttledLog('[WebSocket] Connection error');
        }
        this.notifyHandlers({
          type: 'connection',
          data: { status: 'error' },
        });
      };

      this.ws.onclose = (event) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.stopHeartbeat();
        this.ws = null;

        const connectionDuration = Date.now() - this.connectionStartTime;
        const wasQuickDisconnect = connectionDuration < 500;

        // Only notify disconnected if we were actually connected before,
        // or if this was a quick disconnect (React StrictMode)
        if (this.hasEverConnected || wasQuickDisconnect) {
          this.notifyHandlers({
            type: 'connection',
            data: { status: 'disconnected' },
          });
        }

        // Don't reconnect if intentionally closed
        if (this.isIntentionallyClosed) {
          return;
        }

        // Check if token is still valid before reconnecting
        const { accessToken, isTokenExpired } = useAuthStore.getState();
        if (!accessToken || isTokenExpired()) {
          return;
        }

        // If it was a quick disconnect, reconnect immediately without counting as an attempt
        if (wasQuickDisconnect && this.reconnectAttempts === 0) {
          this.scheduleReconnect(0);
        } else {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
    }
  }

  private handleConnectionFailure(reason: string) {
    this.throttledLog(`[WebSocket] ${reason}`);
    this.notifyHandlers({
      type: 'connection',
      data: { status: 'error' },
    });

    if (!this.isIntentionallyClosed) {
      const { accessToken, isTokenExpired } = useAuthStore.getState();
      if (accessToken && !isTokenExpired()) {
        this.scheduleReconnect();
      }
    }
  }

  private throttledLog(message: string) {
    const now = Date.now();
    if (now - this.lastErrorLog > 30000) {
      console.warn(message);
      this.lastErrorLog = now;
    }
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();

    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.lastToken = null;
    this.hasEverConnected = false;
    this.reconnectAttempts = 0;
  }

  private scheduleReconnect(delay?: number) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.throttledLog('[WebSocket] Max reconnection attempts reached. Giving up until next connect() call.');
      return;
    }

    // Check if token is still valid
    const { accessToken, isTokenExpired } = useAuthStore.getState();
    if (!accessToken || isTokenExpired()) {
      return;
    }

    const reconnectDelay = delay ?? Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 8000);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, reconnectDelay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyHandlers(event: WebSocketEvent) {
    this.eventHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('[WebSocket] Error in event handler:', error);
      }
    });
  }

  subscribe(handler: EventHandler) {
    this.eventHandlers.add(handler);

    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Not connected');
    }
  }

  // Force reconnection with new token
  reconnect() {
    this.disconnect();
    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Get current connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
