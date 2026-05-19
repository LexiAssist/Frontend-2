import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Get all quizzes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/quizzes?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch quizzes', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch quizzes', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch quizzes';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

// Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({
        title: body.title,
        description: body.description,
        course_id: body.courseId,
        time_limit_minutes: body.timeLimitMinutes,
        difficulty: body.difficulty,
        questions: body.questions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to create quiz', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create quiz', error);
    const message = error instanceof Error ? error.message : 'Failed to create quiz';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

