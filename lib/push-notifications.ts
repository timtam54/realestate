'use client'

import { config } from './config'
import toast from 'react-hot-toast'

export async function requestNotificationPermission() {
  console.log('[Push] Checking notification support');

  if (!('Notification' in window)) {
    console.log('[Push] This browser does not support notifications');
    toast.error('Your browser does not support push notifications');
    return false;
  }

  console.log('[Push] Current permission:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log('[Push] Permission already granted');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('[Push] Permission was previously denied');
    toast.error('Notifications are blocked. Please enable them in your browser settings.');
    return false;
  }

  console.log('[Push] Requesting permission from user');
  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Permission response:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('[Push] Error requesting permission:', error);
    toast.error('Failed to request notification permission');
    return false;
  }
}

export async function subscribeToPushNotifications() {
  try {
    console.log('[Push] Subscribing to push notifications');

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('[Push] Service workers not supported');
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    // Add timeout to service worker ready check (20 seconds max)
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker registration timed out after 20 seconds')), 20000)
      )
    ]);
    console.log('[Push] Service worker is ready');

    // Check if push is supported
    if (!('pushManager' in registration)) {
      console.error('[Push] Push manager not supported');
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('[Push] Existing subscription found');
    } else {
      // Subscribe to push notifications
      console.log('[Push] Creating new subscription');

      // Get VAPID key from config
      const vapidPublicKey = config.vapid.publicKey;

      console.log('[Push] VAPID key available:', !!vapidPublicKey);
      console.log('[Push] VAPID key length:', vapidPublicKey?.length);

      if (!vapidPublicKey) {
        console.error('[Push] VAPID public key not configured');
        toast.error('Push notifications are not properly configured. Please contact support.');
        return false;
      }

      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        console.log('[Push] New subscription created');
      } catch (subscribeError) {
        console.error('[Push] Error creating subscription:', subscribeError);
        toast.error('Failed to subscribe to push notifications. Please check your browser settings.');
        return false;
      }
    }

    // Send subscription to the backend (uses session email on server)
    console.log('[Push] Sending subscription to backend');
    const subscriptionJSON = subscription.toJSON();
    console.log('[Push] Subscription data:', JSON.stringify(subscriptionJSON, null, 2));

    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscriptionJSON
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Push] Server error:', errorText);
      throw new Error(`Failed to save subscription: ${response.statusText}`);
    }

    console.log('[Push] Subscription saved successfully');

    // Don't show toast here - the NotificationHeader component will show a success banner
    return true;
  } catch (error) {
    console.error('[Push] Error subscribing to push notifications:', error);
    toast.error('Failed to enable push notifications. Check the console for details.');
    return false;
  }
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}