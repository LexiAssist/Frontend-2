import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/analytics/study-streak`, {
      headers: {
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch study streak', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch study streak', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch study streak';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

