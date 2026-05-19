import { useEffect, useState } from 'react';
import { wsClient, type WebSocketEvent } from '@/services/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect on mount (idempotent - safe to call multiple times)
    wsClient.connect();

    // Subscribe to events
    const unsubscribe = wsClient.subscribe((event: WebSocketEvent) => {
      switch (event.type) {
        case 'connection':
          setIsConnected(event.data.status === 'connected');
          if (event.data.status === 'connected') {
            toast.success('Connected to real-time updates');
          } else if (event.data.status === 'disconnected') {
            toast.error('Disconnected from real-time updates');
          }
          break;

        case 'quiz_completed':
          toast.success(`Quiz completed! Score: ${event.data.score}%`);
          // Invalidate quiz-related queries
          queryClient.invalidateQueries({ queryKey: ['quizzes'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;

        case 'goal_progress':
          toast.success('Goal progress updated!');
          // Invalidate goal-related queries
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;

        case 'material_uploaded':
          toast.success(`New material uploaded: ${event.data.name}`);
          // Invalidate materials queries
          queryClient.invalidateQueries({ queryKey: ['materials'] });
          break;
      }
    });

    // Only unsubscribe from events on unmount - don't disconnect
    // The connection is managed by auth state, not individual hooks
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return { isConnected };
}
