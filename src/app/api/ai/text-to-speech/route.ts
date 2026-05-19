import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    console.log('[TTS API] Request received:', { textLength: body.text?.length, voice: body.voice_id });
    
    const backendUrl = env.NEXT_PUBLIC_API_GATEWAY_URL;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log('[TTS API] Forwarding to gateway:', `${backendUrl}/api/v1/ai/text-to-speech`);
    
    const response = await fetch(`${backendUrl}/api/v1/ai/text-to-speech`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('[TTS API] Gateway response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS API] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: 'TTS failed', status: response.status, details: errorText },
        { status: response.status }
      );
    }

    // Get the audio blob from the backend
    const audioBuffer = await response.arrayBuffer();
    console.log('[TTS API] Audio received:', audioBuffer.byteLength, 'bytes');
    
    if (audioBuffer.byteLength === 0) {
      console.error('[TTS API] Empty audio response');
      return NextResponse.json(
        { error: 'Empty audio response' },
        { status: 500 }
      );
    }
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[TTS API] Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

