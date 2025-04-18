import { useNetworkStatus } from "@/lib/network-status-context";

type SafeFetchOptions = RequestInit & {
  timeout?: number;
  retry?: number;
};

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRY_COUNT = 1;

export async function safeFetch(
  url: string, 
  options: SafeFetchOptions = {},
  addPendingRequest?: () => number,
  removePendingRequest?: () => number
): Promise<Response> {
  const { 
    timeout = DEFAULT_TIMEOUT,
    retry = DEFAULT_RETRY_COUNT,
    ...fetchOptions 
  } = options;
  
  let attemptsLeft = retry + 1;
  let lastError: Error | null = null;

  const shouldTrack = addPendingRequest && removePendingRequest;
  
  if (shouldTrack) {
    addPendingRequest!();
  }
  
  try {
    while (attemptsLeft > 0) {
      try {
        const controller = new AbortController();
        const { signal } = controller;
        
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);
        
        const response = await fetch(url, {
          ...fetchOptions,
          signal,
        });
        
        clearTimeout(timeoutId);
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (--attemptsLeft <= 0) {
          break;
        }
        
        const isAbortError = lastError.name === 'AbortError';
        if (isAbortError) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    throw lastError || new Error('Request failed');
  } finally {
    if (shouldTrack) {
      removePendingRequest!();
    }
  }
}

export function useSafeFetch() {
  const { addPendingRequest, removePendingRequest } = useNetworkStatus();
  
  return (url: string, options: SafeFetchOptions = {}) => 
    safeFetch(url, options, addPendingRequest, removePendingRequest);
} 