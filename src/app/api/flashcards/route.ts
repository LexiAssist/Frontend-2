import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// Get all flashcard decks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/flashcard-decks?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch flashcards', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch flashcards', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch flashcards';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

// Create a new flashcard deck OR generate flashcards from content
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const authHeader = request.headers.get('authorization');
    
    // Check if this is a file upload (generate request)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/study/flashcards`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { message: errorData.detail || errorData.message || 'Failed to generate flashcards' },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // Regular deck creation
    const body = await request.json();

    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1/flashcard-decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({
        title: body.title,
        description: body.description,
        course_id: body.courseId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to create flashcard deck', success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to process request', error);
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { message, success: false },
      { status: 500 }
    );
  }
}

