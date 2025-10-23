'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import Pusher from 'pusher-js'
import { useSession } from 'next-auth/react'
import { useUserData } from '@/hooks/useUserData'

interface Notification {
  id: string
  conversationId: string
  propertyId: number
  propertyTitle: string
  senderName: string
  message: string
  timestamp: Date
}

interface NotificationHeaderProps {
  onOpenChat: (propertyId: number, conversationId?: string) => void | Promise<void>
}

export default function NotificationHeader({ onOpenChat }: NotificationHeaderProps) {
  // console.log('NotificationHeader: Component rendering')
  const { data: session } = useSession()
  const { userId, isLoading: userDataLoading } = useUserData()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const pusherRef = useRef<Pusher | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const subscribedChannelRef = useRef<string | null>(null)

  useEffect(() => {
    console.log('NotificationHeader: Effect running, userId:', userId, 'loading:', userDataLoading)
    if (userDataLoading || !userId) {
      console.log('NotificationHeader: Waiting for user data')
      return
    }

    // Initialize audio for notification sound
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 0.5

    // Initialize Pusher for global notifications
    if (!pusherRef.current) {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1'
      
      if (!pusherKey) {
        console.warn('⚠️ NotificationHeader: Pusher key not configured. Notifications will not work.')
        return
      }
      
      console.log('NotificationHeader: Initializing Pusher with key:', pusherKey.substring(0, 8) + '...')
      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
      })
      
      // Add connection state logging
      pusherRef.current.connection.bind('state_change', (states: any) => {
        console.log('NotificationHeader: Pusher connection state changed from', states.previous, 'to', states.current)
      })
      
      pusherRef.current.connection.bind('connected', () => {
        console.log('✅ NotificationHeader: Pusher connected successfully')
        console.log('Pusher socket ID:', pusherRef.current?.connection.socket_id)
      })
      
      pusherRef.current.connection.bind('error', (error: any) => {
        if (!navigator.onLine) {
          console.warn('⚠️ NotificationHeader: Pusher connection error (offline mode)')
          return
        }
        console.error('❌ NotificationHeader: Pusher connection error:', error)
        if (error?.error?.data?.code === 4001) {
          console.error('Pusher authentication failed. Check your Pusher credentials.')
        }
      })
      
      pusherRef.current.connection.bind('unavailable', () => {
        if (!navigator.onLine) {
          console.warn('⚠️ NotificationHeader: Pusher unavailable (offline mode)')
        } else {
          console.warn('⚠️ NotificationHeader: Pusher unavailable')
        }
      })
    }

    // Subscribe to notifications using cached user ID
    subscribeToNotifications(userId)

    return () => {
      // Cleanup function to unsubscribe
      if (pusherRef.current && subscribedChannelRef.current) {
        pusherRef.current.unsubscribe(subscribedChannelRef.current)
        subscribedChannelRef.current = null
      }
    }
  }, [userId, userDataLoading]) // Re-run when userId is available


  const subscribeToNotifications = (userId: number) => {
    const channelName = `user-notifications-${userId}`
    
    console.log('NotificationHeader: Current user subscribing:', {
      userId: userId,
      email: session?.user?.email,
      channelName: channelName
    })
    
    // Prevent duplicate subscriptions
    if (subscribedChannelRef.current === channelName) {
      console.log('NotificationHeader: Already subscribed to channel:', channelName)
      return
    }
    
    // Unsubscribe from previous channel if exists
    if (subscribedChannelRef.current && pusherRef.current) {
      pusherRef.current.unsubscribe(subscribedChannelRef.current)
    }
    
    console.log('NotificationHeader: Subscribing to channel:', channelName)
    subscribedChannelRef.current = channelName
    const channel = pusherRef.current!.subscribe(channelName)
    
    // Add subscription success/error handlers for debugging
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ NotificationHeader: Successfully subscribed to channel:', channelName)
    })
    
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ NotificationHeader: Failed to subscribe to channel:', channelName, error)
    })
    
    channel.bind('new-message', async (data: any) => {
      console.log('🔔 NotificationHeader: NEW MESSAGE EVENT RECEIVED')
      console.log('NotificationHeader: Notification received by user:', {
        receivingUserId: userId,
        receivingUserEmail: session?.user?.email,
        channelName: channelName,
        conversationId: data.conversationId,
        senderName: data.senderName,
        senderId: data.senderId,
        message: data.message,
        shouldShowNotification: data.senderId !== userId
      })
      console.log('Property ID from notification:', data.propertyId)
      
      // Safety check: Don't show notification if sender is the current user
      // Compare as numbers to avoid type mismatch issues
      // TEMPORARILY DISABLED FOR DEBUGGING
      // if (Number(data.senderId) === Number(userId)) {
      //   console.warn('NotificationHeader: Ignoring notification from self (this should not happen)')
      //   return
      // }
      
      // Fetch property details
      try {
        const propResponse = await fetch(`https://buysel.azurewebsites.net/api/property/${data.propertyId}`)
        const property = await propResponse.json()
        
        const notification: Notification = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          conversationId: data.conversationId,
          propertyId: data.propertyId,
          propertyTitle: property.title || 'Property',
          senderName: data.senderName || 'Someone',
          message: data.message,
          timestamp: new Date()
        }
        
        // Add notification and check for duplicates
        setNotifications(prev => {
          const isDuplicate = prev.some(n => 
            n.conversationId === notification.conversationId &&
            n.message === notification.message &&
            Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 2000
          )
          
          if (isDuplicate) {
            console.log('NotificationHeader: Ignoring duplicate notification')
            return prev
          }
          
          // Not a duplicate, so trigger side effects
          setIsExpanded(true) // Auto-expand on new message
          
          // Play sound if we have audio
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e))
          }
          
          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${notification.senderName}`, {
              body: notification.message,
              icon: '/logo192.png',
              tag: notification.conversationId
            })
          }
          
          return [notification, ...prev]
        })
      } catch (error) {
        console.error('Failed to process notification:', error)
      }
    })
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const openChat = (notification: Notification) => {
    console.log('Opening chat for notification:', notification)
    onOpenChat(notification.propertyId, notification.conversationId)
    dismissNotification(notification.id)
  }

  const unreadCount = notifications.length

  if (unreadCount === 0) return null

  return (
    <>
      {/* Spacer to push content down */}
      <div className={isExpanded ? "h-14" : "h-10"} />
      
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b">
      {/* Notification Bar */}
      <div className="bg-blue-600 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">
              {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Notifications */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto bg-gray-50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {notification.senderName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.propertyTitle}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Conv ID: {notification.conversationId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openChat(notification)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}