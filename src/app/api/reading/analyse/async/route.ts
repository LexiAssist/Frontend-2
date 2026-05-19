import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Async endpoint - returns immediately with job_id
export const maxDuration = 30; // Short timeout, just needs to start the job
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  console.log('[Reading Async API] Starting async analysis job at:', new Date().toISOString());
  
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL;
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward to gateway async endpoint
    const response = await fetch(`${backendUrl}/api/v1/reading/analyse/async`, {
      method: 'POST',
      headers,
      body: formData,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Reading Async API] Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to start analysis', details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[Reading Async API] Job started:', data.job_id);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Reading Async API] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

