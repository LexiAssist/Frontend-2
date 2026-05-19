import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const { attemptId } = await params;

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/quiz-attempts/${attemptId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to complete quiz', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Complete quiz error:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete quiz';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}
