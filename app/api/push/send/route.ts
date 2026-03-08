import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { serverFetchWithAuth } from '@/lib/server-api';
import { z } from 'zod';
import { API_ENDPOINTS } from '@/lib/config';

// Configure web-push with VAPID details
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@buysel.com.au',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Zod schema for input validation
const pushSendSchema = z.object({
  userId: z.number().int().positive(),
  payload: z.object({
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    url: z.string().url().optional(),
    conversationId: z.string().optional(),
    propertyId: z.number().int().positive().optional()
  })
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate input with Zod
  const parseResult = pushSendSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, payload } = parseResult.data;

  try {
    // First, get user's email from userId
    const userResponse = await serverFetchWithAuth(
      API_ENDPOINTS.USER_BY_ID(userId)
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User has no email' },
        { status: 400 }
      );
    }

    // Fetch user's push subscriptions from Azure backend using email
    const subscriptionsResponse = await serverFetchWithAuth(
      API_ENDPOINTS.PUSH_SUBSCRIPTION_BY_EMAIL(userEmail)
    );

    if (!subscriptionsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user subscriptions' },
        { status: 500 }
      );
    }

    const subscriptionsData = await subscriptionsResponse.json();
    const subscriptions = subscriptionsData.subscriptions || [];

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions to send to'
      });
    }

    // Send push notification to all user's subscriptions
    const pushPromises = subscriptions.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(
          subscription.subscription_data,
          JSON.stringify(payload)
        );
        return { success: true };
      } catch (error: any) {
        // If the subscription is invalid (410 Gone), remove it
        if (error.statusCode === 410) {
          // Call Azure backend to remove the subscription
          await serverFetchWithAuth(
            API_ENDPOINTS.PUSH_SUBSCRIPTION_BY_ID(subscription.id),
            {
              method: 'DELETE',
            }
          ).catch(() => { /* silently fail */ });
        }

        return { success: false, error: 'Send failed' };
      }
    });

    const results = await Promise.all(pushPromises);
    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount}/${subscriptions.length} notifications`,
      results
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}
