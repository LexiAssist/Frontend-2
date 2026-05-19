import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    console.log('[Reading Stream API] Auth header received:', authHeader ? 'Present' : 'Missing');
    console.log('[Reading Stream API] All headers:', Object.fromEntries(request.headers.entries()));
    
    // Extract fields from the request
    const file = formData.get('file') as File;
    const userId = formData.get('user_id') as string;
    const summaryType = (formData.get('summary_type') as string) || 'concise';
    const voice = (formData.get('voice') as string) || 'Zephyr';
    
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
    
    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL;
    
    console.log('[Reading Stream API] Starting SSE stream to:', `${backendUrl}/api/v1/reading/analyse/stream`);
    console.log('[Reading Stream API] User ID:', userId);
    console.log('[Reading Stream API] File:', file.name, file.type, file.size);
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make request to backend
    const response = await fetch(`${backendUrl}/api/v1/reading/analyse/stream`, {
      method: 'POST',
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Reading Stream API] Error response:', errorText);
      return NextResponse.json(
        { error: 'Analysis failed', status: response.status, details: errorText },
        { status: response.status }
      );
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Reading Stream API] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

