import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  return NextResponse.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    id: id || "default"
  });
}

export const dynamic = 'force-dynamic'; 