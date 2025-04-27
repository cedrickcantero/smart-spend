"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface NetworkStatusContextType {
  isOnline: boolean;
  pendingRequests: number;
  addPendingRequest: () => number;
  removePendingRequest: () => number;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "You are back online.",
        variant: "success",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "You are currently offline. Some features may not work properly.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const addPendingRequest = useCallback(() => {
    setPendingRequests(prev => prev + 1);
    return pendingRequests + 1;
  }, [pendingRequests]);

  const removePendingRequest = useCallback(() => {
    setPendingRequests(prev => Math.max(0, prev - 1));
    return Math.max(0, pendingRequests - 1);
  }, [pendingRequests]);

  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        pendingRequests,
        addPendingRequest,
        removePendingRequest,
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  
  if (context === undefined) {
    throw new Error("useNetworkStatus must be used within a NetworkStatusProvider");
  }
  
  return context;
} 