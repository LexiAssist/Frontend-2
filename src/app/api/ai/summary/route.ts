import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/ai/generate/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({
        query: body.content || body.text,
        user_id: body.userId,
        context_chunks: body.contextChunks || [],
        material_id: body.materialId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to generate summary', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to generate summary', error);
    const message = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

