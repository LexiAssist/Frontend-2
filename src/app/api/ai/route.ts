import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

/**
 * AI Proxy Route
 * Forwards AI-related requests to the Python AI Orchestrator
 * Adds authentication and internal headers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to AI service
    const response = await fetch(`${env.NEXT_PUBLIC_AI_PROXY_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lexi-internal-caller': 'frontend-proxy',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'AI service error', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/models
 * Returns available AI models
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_AI_PROXY_URL}/api/ai/models`, {
      headers: {
        'x-lexi-internal-caller': 'frontend-proxy',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch models' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

