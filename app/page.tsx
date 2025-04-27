"use client"

import React, { useEffect } from 'react';
import { checkSession } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await checkSession();
        if (session && session.user) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error('Error checking session:', error);
        router.push("/login");
      }
    };

    fetchSession();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">SmartSpend</h1>
        <p className="text-muted-foreground">Loading your financial dashboard...</p>
      </div>
    </div>
  );
}
