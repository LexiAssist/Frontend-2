'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/Icon';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-3 max-w-md text-slate-600">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-lg bg-slate-100 p-4 text-left">
            <p className="text-sm font-mono text-red-600">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} leftIcon={<RefreshCcw size={18} />}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
