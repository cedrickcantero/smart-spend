import { supabase } from '@/lib/supabase/client';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const checkSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

/**
 * Checks if the current authenticated user has superuser (service_role) privileges
 * @returns Promise<boolean> - True if the user is a superuser, false otherwise
 */
export async function isCurrentUserSuperuser(): Promise<boolean> {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return false;
  
  // Check if the user has the service_role in their JWT
  const jwt = session.access_token;
  
  try {
    // Decode the JWT to check the role claim
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.role === 'service_role';
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return false;
  }
}

/**
 * Alternative approach using RLS policies by attempting a privileged operation
 * This relies on the RLS policies you've set up
 */
export async function checkSuperuserAccess(): Promise<boolean> {
  // Try to perform an operation that only superusers can do
  // For example, try to insert a dummy color (we'll delete it right after)
  const testId = 'test-' + Date.now();
  
  try {
    // Attempt a superuser-only operation
    const { error: insertError } = await supabase
      .from('colors')
      .insert({
        id: testId,
        name: 'Test Color',
        hex_value: '#000000',
        tailwind_key: 'test'
      });
    
    // If there was no error, the user is a superuser
    const isSuperuser = !insertError;
    
    // Clean up the test entry if it was created
    if (isSuperuser) {
      await supabase.from('colors').delete().eq('id', testId);
    }
    
    return isSuperuser;
  } catch (error) {
    console.error('Error checking superuser access:', error);
    return false;
  }
}

/**
 * Checks if the current user has admin privileges based on user settings
 * @returns Promise<boolean> - True if the user is an admin, false otherwise
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    // Call the is_admin function from PostgreSQL
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get the user's role from their settings
 * @returns Promise<string> - The user's role or 'guest' if not logged in
 */
export async function getUserRole(): Promise<string> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 'guest';
    
    // Get user settings
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .single();
    
    if (error || !data || !data.settings) {
      console.error('Error fetching user settings:', error);
      return 'user';
    }
    
    return data.settings.role || 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user';
  }
}