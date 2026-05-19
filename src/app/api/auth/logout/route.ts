import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

/**
 * POST /api/auth/logout
 * Handles user logout
 */
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      console.error('Logout failed:', await response.text());
    }

    // Clear the session cookie regardless of backend response
    const nextResponse = NextResponse.json({ success: true });
    nextResponse.cookies.delete('session_token');
    
    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

