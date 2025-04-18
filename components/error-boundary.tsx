"use client";

import React, { ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const defaultFallback = (
        <div className="flex flex-col items-center justify-center p-6 min-h-[200px] rounded-lg border border-destructive/20 bg-destructive/5 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
          <h3 className="font-semibold text-lg mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <Button 
            variant="outline" 
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );

      return this.props.fallback || defaultFallback;
    }

    return this.props.children;
  }
}

export { ErrorBoundary }; 