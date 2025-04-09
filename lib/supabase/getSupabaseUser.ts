import { createSupabaseClientWithToken } from './withToken'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { getUserSession } from '@/lib/server/auth'
import { NextRequest } from 'next/server'

type AuthContext =
  | { error: string; status: number }
  | { supabase: SupabaseClient<Database>; user: unknown }

export async function getUserFromRequest(request: Request): Promise<AuthContext> {
  const session = await getUserSession(request as NextRequest)
  const token = session?.access_token

  if (!token) {
    return { error: 'No token provided', status: 401 }
  }

  const supabase = createSupabaseClientWithToken(token)
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log("error", error);

  console.log("user", user);

  if (error || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  return { supabase, user }
}
