"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface RetryOperationProps {
  onRetry: () => void;
  message?: string;
  buttonText?: string;
  isCompact?: boolean;
}

export function RetryOperation({
  onRetry,
  message = "Something went wrong with this operation",
  buttonText = "Retry",
  isCompact = false
}: RetryOperationProps) {
  if (isCompact) {
    return (
      <div className="flex flex-col items-center justify-center py-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          {buttonText}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
        <h3 className="font-medium text-lg mb-1">Operation Failed</h3>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        <Button 
          variant="default" 
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {buttonText}
        </Button>
      </div>
    </Card>
  );
} 