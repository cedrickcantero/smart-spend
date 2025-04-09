import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get the user session from a Next.js API request
 * Uses server-side Supabase client with proper cookie handling
 */
export async function getUserSession(request: NextRequest) {
  // Create a server-side Supabase client
  const supabase = await createClient();
  
  // Get the authorization header
  const authHeader = request.headers.get('Authorization');
  let session;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract the token
    const token = authHeader.substring(7);
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (!error && data.user) {
      // Create a minimal session object with the user
      session = {
        user: data.user,
        access_token: token
      };
    }
  } else {
    // Get session from cookies (handled by the server client)
    const { data } = await supabase.auth.getSession();
    session = data.session;
  }
  
  return session;
}

/**
 * Verify that a user is authenticated and get their ID
 * Returns the user ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(request: NextRequest) {
  const session = await getUserSession(request);
  return session?.user?.id || null;
} 