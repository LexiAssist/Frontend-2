'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900">
              Critical Error
            </h1>
            <p className="mt-4 text-slate-600">
              A critical error has occurred. Please refresh the page or contact support.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
