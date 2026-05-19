import { NextRequest, NextResponse } from 'next/server';
import { sendWaitlistConfirmation } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

// Lazy import db to avoid Prisma initialization during build
async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

// POST /api/waitlist - Add a new entry to the waitlist
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEntry = await db.waitlistEntry.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      );
    }

    // Create waitlist entry
    const entry = await db.waitlistEntry.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
    });

    // Send confirmation email (don't await - let it happen in background)
    // Email failure should NOT break the API response
    sendWaitlistConfirmation({ name: name.trim(), email: email.toLowerCase().trim() })
      .then((result) => {
        if (result.success) {
          console.log('Confirmation email sent:', result.messageId);
        } else {
          console.error('Failed to send confirmation email:', result.error);
        }
      })
      .catch((error) => {
        console.error('Unexpected error sending confirmation email:', error);
      });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully added to waitlist',
        entry: {
          id: entry.id,
          name: entry.name,
          email: entry.email,
          createdAt: entry.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/waitlist - Get all waitlist entries (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    // Optional: Add authentication check here for admin access
    // For now, we'll return a limited set of data
    
    const entries = await db.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

