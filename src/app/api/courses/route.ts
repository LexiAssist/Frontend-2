import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Get all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/courses?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch courses', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch courses', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch courses';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

// Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({
        name: body.name,
        description: body.description,
        color: body.color,
        semester: body.semester,
        year: body.year,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to create course', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create course', error);
    const message = error instanceof Error ? error.message : 'Failed to create course';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

