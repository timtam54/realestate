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

    console.log('[API] Sending push notification to user:', userId);

    // First, get user's email from userId
    const userResponse = await serverFetchWithAuth(
      API_ENDPOINTS.USER_BY_ID(userId)
    );

    if (!userResponse.ok) {
      console.error('[API] Failed to fetch user:', userResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      console.error('[API] User has no email:', userId);
      return NextResponse.json(
        { error: 'User has no email' },
        { status: 400 }
      );
    }

    console.log('[API] Fetching subscriptions for email:', userEmail);

    // Fetch user's push subscriptions from Azure backend using email
    const subscriptionsResponse = await serverFetchWithAuth(
      API_ENDPOINTS.PUSH_SUBSCRIPTION_BY_EMAIL(userEmail)
    );

    if (!subscriptionsResponse.ok) {
      console.error('[API] Failed to fetch subscriptions:', subscriptionsResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch user subscriptions' },
        { status: 500 }
      );
    }

    const subscriptionsData = await subscriptionsResponse.json();
    const subscriptions = subscriptionsData.subscriptions || [];

    if (subscriptions.length === 0) {
      console.log('[API] No subscriptions found for user:', userId, 'email:', userEmail);
      return NextResponse.json({
        success: true,
        message: 'No subscriptions to send to'
      });
    }

    console.log(`[API] Found ${subscriptions.length} subscription(s) for email:`, userEmail);

    // Send push notification to all user's subscriptions
    const pushPromises = subscriptions.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(
          subscription.subscription_data,
          JSON.stringify(payload)
        );
        console.log('[API] Push notification sent successfully');
        return { success: true };
      } catch (error: any) {
        console.error('[API] Error sending push notification:', error);

        // If the subscription is invalid (410 Gone), remove it
        if (error.statusCode === 410) {
          console.log('[API] Subscription expired, removing...');
          // Call Azure backend to remove the subscription
          await serverFetchWithAuth(
            API_ENDPOINTS.PUSH_SUBSCRIPTION_BY_ID(subscription.id),
            {
              method: 'DELETE',
            }
          ).catch(err => console.error('[API] Failed to remove expired subscription:', err));
        }

        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(pushPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`[API] Sent ${successCount}/${subscriptions.length} notifications successfully`);

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount}/${subscriptions.length} notifications`,
      results
    });

  } catch (error) {
    console.error('[API] Error in push send endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
