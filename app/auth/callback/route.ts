import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // In a real app, this would exchange the code for a session
  // For our mock, we'll just redirect to the dashboard
  // The actual auth is handled by the client-side auth context

  return NextResponse.redirect(new URL("/dashboard", request.url))
}
