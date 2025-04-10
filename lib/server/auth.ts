import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get the authenticated user from a Next.js API request
 * Uses server-side Supabase client with proper authentication verification
 */
export async function getAuthenticatedUser(request: NextRequest) {
  // Create a server-side Supabase client
  const supabase = await createClient();
  
  // Get the authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract the token
    const token = authHeader.substring(7);
    
    // Verify the token with Supabase Auth server (secure)
    const { data, error } = await supabase.auth.getUser(token);
    
    if (!error && data.user) {
      return {
        user: data.user,
        access_token: token
      };
    }
  }
  
  // If no valid token in header, get session from cookies but verify with getUser
  try {
    // This is secure because we're not just trusting cookies - we're verifying with the Auth server
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (!userError && userData.user) {
      return {
        user: userData.user,
        access_token: null // We don't have the token, but we have a verified user
      };
    }
  } catch (error) {
    console.error('Error verifying user session:', error);
  }
  
  return null;
}

/**
 * Verify that a user is authenticated and get their ID
 * Returns the user ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(request: NextRequest) {
  const authData = await getAuthenticatedUser(request);
  return authData?.user?.id || null;
} 