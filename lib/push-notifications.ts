'use client'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function subscribeToPushNotifications(userId: number) {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if push is supported
    if (!('pushManager' in registration)) {
      throw new Error('Push notifications not supported');
    }

    // For now, skip push notifications if no VAPID key
    // You'll need to generate VAPID keys and add them to your .env
    console.log('Push notifications require VAPID keys to be configured');
    return false;
    
    /* Uncomment when you have VAPID keys:
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
    });
    */

    // Send subscription to your Azure backend
    await fetch('https://buysel.azurewebsites.net/api/push_subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        subscription_data: subscription.toJSON()
      }),
    });

    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
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