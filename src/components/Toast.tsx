/**
 * Toast Notification System
 * 
 * Wrapper around react-hot-toast for displaying success, error, warning, and info toasts.
 * Supports auto-dismiss with configurable timeout and manual dismissal.
 * 
 * Requirement 21.1: Display success, error, warning, and info toasts
 */

'use client';

import toast, { Toaster as HotToaster } from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: string;
}

/**
 * Show a toast notification
 * 
 * @param type - Type of toast (success, error, warning, info)
 * @param message - Message to display
 * @param options - Optional configuration
 */
export function showToast(
  type: ToastType,
  message: string,
  options?: ToastOptions
) {
  const defaultDuration = type === 'error' ? 4000 : 3000;
  const duration = options?.duration ?? defaultDuration;

  const toastOptions = {
    duration,
    position: options?.position,
    icon: options?.icon,
  };

  switch (type) {
    case 'success':
      return toast.success(message, toastOptions);
    case 'error':
      return toast.error(message, toastOptions);
    case 'warning':
      return toast(message, {
        ...toastOptions,
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
    case 'info':
      return toast(message, {
        ...toastOptions,
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      });
  }
}

/**
 * Convenience methods for each toast type
 */
export const Toast = {
  success: (message: string, options?: ToastOptions) => 
    showToast('success', message, options),
  
  error: (message: string, options?: ToastOptions) => 
    showToast('error', message, options),
  
  warning: (message: string, options?: ToastOptions) => 
    showToast('warning', message, options),
  
  info: (message: string, options?: ToastOptions) => 
    showToast('info', message, options),
  
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ) => toast.promise(promise, messages, options),
};

/**
 * Toaster component - should be placed in root layout
 * Already integrated in WebSocketProvider, but exported for flexibility
 */
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

export default Toast;
