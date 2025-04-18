"use client";

import { useNetworkStatus } from '@/lib/network-status-context';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatusIndicator() {
  const { isOnline, pendingRequests } = useNetworkStatus();
  
  // Don't render anything if online and no pending requests
  if (isOnline && pendingRequests === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full shadow-md font-medium text-sm",
        isOnline ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
      )}>
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Offline</span>
          </>
        ) : pendingRequests > 0 ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>Online</span>
          </>
        )}
      </div>
    </div>
  );
} 