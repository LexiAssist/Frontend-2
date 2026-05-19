import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// CRITICAL: These exports must be at the top of the file for Next.js to recognize them
export const maxDuration = 300; // 5 minutes (300 seconds)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  console.log('[Reading API] Request received at:', new Date().toISOString());
  
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    // Extract fields from the request
    const file = formData.get('file') as File;
    const userId = formData.get('user_id') as string;
    const summaryType = (formData.get('summary_type') as string) || 'concise';
    const voice = (formData.get('voice') as string) || 'Zephyr';
    const speakerLabel = (formData.get('speaker_label') as string) || 'Reader';
    const temperature = (formData.get('temperature') as string) || '1.0';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No user_id provided' },
        { status: 400 }
      );
    }
    
    // Create new form data for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('user_id', userId);
    backendFormData.append('summary_type', summaryType);
    backendFormData.append('voice', voice);
    backendFormData.append('speaker_label', speakerLabel);
    backendFormData.append('temperature', temperature);
    
    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL;
    
    console.log('[Reading API] Sending request to:', `${backendUrl}/api/v1/reading/analyse`);
    console.log('[Reading API] User ID:', userId);
    console.log('[Reading API] File:', file.name, file.type, file.size);
    console.log('[Reading API] Starting fetch at:', new Date().toISOString());
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // No AbortController - let it run as long as needed
    // maxDuration: 300 at top of file should handle the timeout
    const response = await fetch(`${backendUrl}/api/v1/reading/analyse`, {
      method: 'POST',
      headers,
      body: backendFormData,
      cache: 'no-store',
    });
    
    const elapsedMs = Date.now() - requestStartTime;
    console.log(`[Reading API] Response received after ${elapsedMs}ms at:`, new Date().toISOString());
    console.log('[Reading API] Response status:', response.status);

    const responseText = await response.text();
    console.log('[Reading API] Response body length:', responseText.length);

    if (!response.ok) {
      console.error('[Reading API] Error response:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Analysis failed', status: response.status, details: responseText },
        { status: response.status }
      );
    }

    // Parse successful response
    try {
      const data = JSON.parse(responseText);
      console.log('[Reading API] Success - returning data at:', new Date().toISOString());
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('[Reading API] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from backend', details: responseText.substring(0, 500) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Reading API] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

