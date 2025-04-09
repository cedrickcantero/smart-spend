import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase/getSupabaseUser'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerFn<T = any> = (args: {
  request: Request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
}) => Promise<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleRequest<T = any>(
  request: Request,
  handler: HandlerFn<T>
): Promise<Response> {
  try {
    console.log("request", request);
    const result = await getUserFromRequest(request)

    console.log("result", result);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { user, supabase } = result
    const data = await handler({ request, user, supabase })

    return NextResponse.json(data)
  } catch (error) {
    console.error('handleRequest error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
