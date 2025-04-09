"use client"

import React, { useEffect, useState } from 'react';
import { checkSession } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await checkSession();
        console.log("session", session);
        if (session && session.user) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    fetchSession();
  }, []);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {isLoggedIn ? (
        <p>You are logged in!</p>
      ) : (
        <p>Please log in to access more features.</p>
      )}
    </div>
  );
}
