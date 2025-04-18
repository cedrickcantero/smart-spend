import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  return NextResponse.json({ 
    success: true,
    message: "This response was very slow!" 
  });
}

export const dynamic = 'force-dynamic'; 