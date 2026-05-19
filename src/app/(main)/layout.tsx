'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Sidebar from './_components/Sidebar';
import { SyncProvider } from '@/components/SyncProvider';
import { useAuthStore } from '@/store/authStore';

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Requirement 6.3: Check authentication state
    // Requirement 6.5: Check token validity
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      // Requirement 6.2: Redirect to login with original URL as query parameter
      hasRedirected.current = true;
      const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, searchParams]);

  // Show loading state while checking authentication
  // This satisfies the requirement to show loading state while checking auth
  if (isLoading || (!isAuthenticated && !hasRedirected.current)) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-500)] mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  // This prevents flash of protected content before redirect
  if (!isAuthenticated) {
    return null;
  }

  // Requirement 6.3: Allow authenticated users to proceed
  return (
    <SyncProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Sidebar - includes mobile header and bottom nav */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex flex-col flex-1 overflow-hidden relative z-0 lg:pl-[300px]">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pt-24 sm:pt-28 lg:pt-8 pb-safe lg:pb-0 px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="max-w-6xl mx-auto animate-page-enter">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SyncProvider>
  );
}