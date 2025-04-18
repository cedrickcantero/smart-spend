import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name) {
        if (typeof document === 'undefined') return ''
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1] : ''
      },
      set(name, value, options) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=${value}; path=${options?.path || '/'}`
      },
      remove(name, options) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; path=${options?.path || '/'};
          expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    },
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        const { signal } = controller;
        
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const fetchPromise = fetch(url, { ...options, signal });
        
        return fetchPromise.finally(() => clearTimeout(timeoutId));
      }
    }
  }
)