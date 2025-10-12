'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider with optimized default configuration
 * Implements stale-while-revalidate caching strategy with optimistic updates
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale-while-revalidate strategy
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)
            
            // Refetch behavior
            refetchOnWindowFocus: true, // Refetch when window regains focus
            refetchOnReconnect: true, // Refetch when reconnecting
            refetchOnMount: true, // Refetch on component mount
            
            // Retry configuration
            retry: 1, // Retry failed requests once
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Error handling
            throwOnError: false, // Don't throw errors, handle them in components
            
            // Network mode for better offline support
            networkMode: 'online', // Only fetch when online
          },
          mutations: {
            // Retry configuration for mutations
            retry: 0, // Don't retry mutations by default
            
            // Error handling
            throwOnError: false,
            
            // Network mode
            networkMode: 'online',
            
            // Optimistic updates are handled per-mutation
            // This is just the default configuration
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
