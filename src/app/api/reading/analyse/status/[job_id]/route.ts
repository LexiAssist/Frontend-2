import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Status endpoint - lightweight polling
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');
  const authHeader = request.headers.get('authorization');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }
  
  try {
    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL;
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward to gateway status endpoint
    const response = await fetch(
      `${backendUrl}/api/v1/reading/analyse/status/${job_id}?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Reading Status API] Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to get status', details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Reading Status API] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}
