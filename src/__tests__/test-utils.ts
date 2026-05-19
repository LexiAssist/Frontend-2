/**
 * Shared test utilities for consistent testing setup
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactElement } from 'react';

/**
 * Creates a fresh QueryClient for each test with consistent configuration
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Creates a wrapper component with QueryClientProvider for testing hooks
 */
export function createQueryWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: React.ReactElement }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

/**
 * Cleanup utility for QueryClient after each test
 */
export async function cleanupQueryClient(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
}

/**
 * Combined setup utility that returns queryClient, wrapper, and cleanup function
 */
export function setupQueryTest() {
  const queryClient = createTestQueryClient();
  const wrapper = createQueryWrapper(queryClient);

  return {
    queryClient,
    wrapper,
    cleanup: () => cleanupQueryClient(queryClient),
  };
}