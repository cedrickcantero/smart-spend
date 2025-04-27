"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeFetch } from '@/lib/safe-fetch';
import { RetryOperation } from '@/components/retry-operation';
import { Loader2, Clock, WifiOff, Timer } from 'lucide-react';
import { useNetworkStatus } from '@/lib/network-status-context';

export function TestNetworkHandling() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const safeFetch = useSafeFetch();
  const { isOnline } = useNetworkStatus();

  const testNormalRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await safeFetch('/api/health-check');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError((err as Error).message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testTimeout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await safeFetch('/api/simulate-timeout', {
        timeout: 3000 
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError((err as Error).message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testConcurrentRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promises = Array(5).fill(0).map((_, i) => 
        safeFetch(`/api/health-check?id=${i}`).then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      setResult(JSON.stringify(results, null, 2));
    } catch (err) {
      setError((err as Error).message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Network Error Handling Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Network Features</CardTitle>
          <CardDescription>Use these buttons to test different network scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={testNormalRequest} disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Test Normal Request
            </Button>
            
            <Button onClick={testTimeout} disabled={isLoading} variant="outline" className="gap-2">
              <Timer className="h-4 w-4" />
              Test Timeout
            </Button>
            
            <Button onClick={testConcurrentRequests} disabled={isLoading} variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Test Concurrent Requests
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Network Status: </div>
            <div className="flex items-center gap-2 text-sm">
              {isOnline ? (
                <span className="flex items-center gap-1 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-destructive">
                  <WifiOff className="h-4 w-4" />
                  Offline
                </span>
              )}
            </div>
          </div>
          
          {isLoading && (
            <div className="p-4 border rounded-md flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          )}
          
          {error && (
            <RetryOperation 
              message={error} 
              onRetry={() => setError(null)} 
            />
          )}
          
          {!isLoading && !error && result && (
            <div className="p-4 border rounded-md overflow-auto max-h-64">
              <pre className="text-sm">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Test Network Offline State:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open Chrome DevTools (F12) and go to Network tab</li>
              <li>Check &ldquo;Offline&rdquo; checkbox to simulate offline state</li>
              <li>Try any of the test buttons above</li>
              <li>Notice the network indicator and error handling</li>
              <li>Uncheck &ldquo;Offline&rdquo; to restore connection</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Test Request Timeouts:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Use the &ldquo;Test Timeout&rdquo; button</li>
              <li>In Chrome DevTools Network tab, use throttling to &ldquo;Slow 3G&rdquo;</li>
              <li>Observe how the request is aborted after the timeout period</li>
              <li>Check how the error is displayed in the UI</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Test Concurrent Requests:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click &ldquo;Test Concurrent Requests&rdquo;</li>
              <li>Observe the network indicator showing loading state</li>
              <li>Multiple requests should be visible in the Network tab</li>
              <li>All should complete and the results should display below</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 