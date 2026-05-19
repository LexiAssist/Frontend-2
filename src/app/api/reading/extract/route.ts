import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL;

    console.log('[Reading Extract API] Sending request to:', `${backendUrl}/api/v1/reading/extract`);
    console.log('[Reading Extract API] File:', file.name, file.type, file.size);

    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2 * 60 * 1000);

    const response = await fetch(`${backendUrl}/api/v1/reading/extract`, {
      method: 'POST',
      headers,
      body: backendFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log('[Reading Extract API] Response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Extraction failed', status: response.status, details: responseText },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend', details: responseText },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Reading Extract API] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

