'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useUserData } from '@/hooks/useUserData'
import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/push-notifications'

interface NotificationHeaderProps {
  onOpenChat?: (propertyId: number, conversationId?: string) => void | Promise<void>
}

export default function NotificationHeader({ onOpenChat }: NotificationHeaderProps) {
  const { user, isAuthenticated } = useAuth()
  const { userId, isLoading: userDataLoading } = useUserData()
  const [showPermissionBanner, setShowPermissionBanner] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isEnabling, setIsEnabling] = useState(false)

  useEffect(() => {
    console.log('[NotificationHeader] Effect running, userId:', userId, 'loading:', userDataLoading)

    if (userDataLoading || !userId) {
      console.log('[NotificationHeader] Waiting for user data')
      return
    }

    // Check notification permission status
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        // Show banner to request permission
        setShowPermissionBanner(true)
      } else if (Notification.permission === 'granted' && !isSubscribed) {
        // Auto-subscribe if permission already granted
        handleEnableNotifications()
      }
    }
  }, [userId, userDataLoading])

  const handleEnableNotifications = async () => {
    console.log('[NotificationHeader] Requesting notification permission')
    setIsEnabling(true)

    try {
      const permissionGranted = await requestNotificationPermission()

      if (permissionGranted) {
        console.log('[NotificationHeader] Permission granted, subscribing to push')
        const subscribed = await subscribeToPushNotifications()
        setIsSubscribed(subscribed)
        if (subscribed) {
          setShowPermissionBanner(false)
        }
      } else {
        console.warn('[NotificationHeader] Permission denied')
        alert('Notification permission was denied. To enable notifications, please allow them in your browser settings.')
      }
    } catch (error) {
      console.error('[NotificationHeader] Error enabling notifications:', error)
      alert('Failed to enable notifications. Please try again or check your browser settings.')
    } finally {
      setIsEnabling(false)
    }
  }

  const handleDismissBanner = () => {
    setShowPermissionBanner(false)
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('notification-banner-dismissed', Date.now().toString())
  }

  // Check if banner was recently dismissed
  useEffect(() => {
    const dismissedAt = localStorage.getItem('notification-banner-dismissed')
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        // Don't show banner if dismissed within last 7 days
        setShowPermissionBanner(false)
      }
    }
  }, [])

  if (!showPermissionBanner) return null

  return (
    <>
      {/* Spacer to push content down */}
      <div className="h-14" />

      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Enable Push Notifications</p>
                <p className="text-sm text-blue-100">
                  Get notified instantly when you receive messages, even when the app is closed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleEnableNotifications}
                disabled={isEnabling}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnabling ? 'Enabling...' : 'Enable'}
              </button>
              <button
                onClick={handleDismissBanner}
                className="p-2 hover:bg-blue-700 rounded transition-colors"
                title="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}