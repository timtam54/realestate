'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/push-notifications'

export default function PushNotificationTestPanel() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    permission: NotificationPermission | 'unknown'
    isSubscribed: boolean
    serviceWorkerReady: boolean
    localStorageFlag: boolean
  }>({
    permission: 'unknown',
    isSubscribed: false,
    serviceWorkerReady: false,
    localStorageFlag: false
  })
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unknown'
      const localStorageFlag = localStorage.getItem('push-notifications-enabled') === 'true'

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        setSubscriptionStatus({
          permission,
          isSubscribed: subscription !== null,
          serviceWorkerReady: true,
          localStorageFlag
        })
      } else {
        setSubscriptionStatus({
          permission,
          isSubscribed: false,
          serviceWorkerReady: false,
          localStorageFlag
        })
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      const permissionGranted = await requestNotificationPermission()
      
      if (permissionGranted) {
        const subscribed = await subscribeToPushNotifications()
        
        if (subscribed) {
          localStorage.setItem('push-notifications-enabled', 'true')
          await checkSubscriptionStatus()
          alert('✅ Push notifications enabled successfully!')
        } else {
          alert('❌ Failed to subscribe to push notifications')
        }
      } else {
        alert('❌ Notification permission denied')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      alert('❌ Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        
        if (subscription) {
          await subscription.unsubscribe()
          localStorage.removeItem('push-notifications-enabled')
          await checkSubscriptionStatus()
          alert('✅ Unsubscribed from push notifications')
        }
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      alert('❌ Error unsubscribing')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 max-w-sm">
        {/* Header - Always Visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="font-semibold">Push Notifications Test</span>
          </div>
          <div className="flex items-center gap-2">
            {subscriptionStatus.isSubscribed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="p-4 border-t">
            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Permission:</span>
                {subscriptionStatus.permission === 'granted' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Subscribed:</span>
                {subscriptionStatus.isSubscribed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Service Worker:</span>
                {subscriptionStatus.serviceWorkerReady ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Local Flag:</span>
                {subscriptionStatus.localStorageFlag ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={checkSubscriptionStatus}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>

              {!subscriptionStatus.isSubscribed ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  <Bell className="w-4 h-4" />
                  {loading ? 'Enabling...' : 'Enable Notifications'}
                </button>
              ) : (
                <button
                  onClick={handleUnsubscribe}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Unsubscribe
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
