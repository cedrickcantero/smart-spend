import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase' 

export function createSupabaseClientWithToken(token: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )
}
