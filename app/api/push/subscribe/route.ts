import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Missing required field: subscription' },
        { status: 400 }
      );
    }

    console.log('[API] Saving push subscription for email:', session.user.email);

    // Send subscription to Azure backend using email
    const response = await fetch(
      'https://buysel.azurewebsites.net/api/push/push_subscription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          subscription_data: subscription,
          platform: 'web'
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Failed to save subscription to backend:', errorText);
      throw new Error(`Backend error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[API] Subscription saved successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully'
    });

  } catch (error) {
    console.error('[API] Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
