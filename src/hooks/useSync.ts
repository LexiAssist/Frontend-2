import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { wsClient, type WebSocketEvent } from '@/services/websocket';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SyncState {
  isConnected: boolean;
  lastSync: Date | null;
}

export function useSync(): SyncState {
  const queryClient = useQueryClient();
  const { accessToken, isTokenExpired } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const wasConnectedRef = useRef(false);
  const warnedRef = useRef(false);

  useEffect(() => {
    // Subscribe to connection events
    const unsubscribe = wsClient.subscribe((event: WebSocketEvent) => {
      switch (event.type) {
        case 'connection': {
          const nowConnected = event.data.status === 'connected';
          setIsConnected(nowConnected);

          if (nowConnected) {
            wasConnectedRef.current = true;
            warnedRef.current = false;
            toast.success('Connected to real-time updates');
          } else if (event.data.status === 'disconnected') {
            // Only show disconnect toast if we were actually connected before
            if (wasConnectedRef.current) {
              toast.error('Disconnected from real-time updates');
              wasConnectedRef.current = false;
            }
          } else if (event.data.status === 'error') {
            // Show a single warning if connection keeps failing and backend seems down
            if (!warnedRef.current) {
              toast.error('Real-time updates unavailable — backend may be offline');
              warnedRef.current = true;
            }
          }
          break;
        }

        case 'sync':
        case 'update':
          setLastSync(new Date());
          break;

        case 'quiz_completed':
          toast.success(`Quiz completed! Score: ${event.data.score}%`);
          queryClient.invalidateQueries({ queryKey: ['quizzes'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;

        case 'goal_progress':
          toast.success('Goal progress updated!');
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;

        case 'material_uploaded':
          toast.success(`New material uploaded: ${event.data.name}`);
          queryClient.invalidateQueries({ queryKey: ['materials'] });
          break;
      }
    });

    // Manage connection based on auth state
    if (accessToken && !isTokenExpired()) {
      wsClient.connect();
    } else {
      wsClient.disconnect();
      wasConnectedRef.current = false;
    }

    return () => {
      unsubscribe();
      wsClient.disconnect();
      setIsConnected(false);
    };
  }, [accessToken, isTokenExpired, queryClient]);

  return {
    isConnected,
    lastSync,
  };
}

// Query keys for React Query
export const syncKeys = {
  all: ['sync'] as const,
  status: () => [...syncKeys.all, 'status'] as const,
};

export default useSync;
