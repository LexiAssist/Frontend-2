'use client';

import { cn } from '@/lib/utils';
import { Icon } from "@/components/Icon";
import { useEffect, useState } from 'react';
import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substring(7) },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Helper functions for common toast types
export const toast = {
  success: (message: string, duration = 5000) => {
    useToastStore.getState().addToast({ type: 'success', message, duration });
  },
  error: (message: string, duration = 5000) => {
    useToastStore.getState().addToast({ type: 'error', message, duration });
  },
  warning: (message: string, duration = 5000) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration });
  },
  info: (message: string, duration = 5000) => {
    useToastStore.getState().addToast({ type: 'info', message, duration });
  },
};

const iconNames = {
  success: 'check-circle' as const,
  error: 'x' as const,
  warning: 'alert-circle' as const,
  info: 'info' as const,
};

const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const [isExiting, setIsExiting] = useState(false);
  const iconName = iconNames[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => removeToast(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
        styles[toast.type],
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
      role="alert"
    >
      <Icon name={iconName} size={20} className={cn('shrink-0', iconStyles[toast.type])} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => removeToast(toast.id), 300);
        }}
        className="shrink-0 rounded p-1 hover:bg-black/5"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
