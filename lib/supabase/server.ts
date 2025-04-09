import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(token?: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options)
          } catch {}
        },
        remove(name, options) {
          try {
            cookieStore.set(name, '', {
              ...options,
              maxAge: -1
            })
          } catch {}
        }
      }
    }
  )

  // 👇 this is the crucial part
  if (token) {
    supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    }).catch(() => {})
  }

  return supabase
}
