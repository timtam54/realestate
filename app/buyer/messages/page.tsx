'use client'

import { useState } from 'react'
import { MessageSquare, Send, Lock, Unlock, AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: string
  isRead: boolean
  isPIIMasked: boolean
}

interface MessageThread {
  id: string
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  propertyImage: string
  sellerId: string
  sellerName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  contactShared: boolean
  buyerConsent: boolean
  sellerConsent: boolean
  messages: Message[]
}

const mockThreads: MessageThread[] = [
  {
    id: 'T001',
    propertyId: 'L001',
    propertyTitle: 'Modern Family Home in Edge Hill',
    propertyAddress: '42 Sunset Drive, Edge Hill',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=100&h=100&fit=crop',
    sellerId: 'U123',
    sellerName: 'John Smith',
    lastMessage: "Thanks for your interest! The property is still available. Would you like to schedule a viewing?",
    lastMessageTime: '2 hours ago',
    unreadCount: 1,
    contactShared: false,
    buyerConsent: false,
    sellerConsent: false,
    messages: [
      {
        id: 'M001',
        text: "Hi, I'm interested in your property. Is it still available?",
        senderId: 'current-user',
        senderName: 'You',
        timestamp: '2024-01-21 09:00',
        isRead: true,
        isPIIMasked: false
      },
      {
        id: 'M002',
        text: "Thanks for your interest! The property is still available. Would you like to schedule a viewing?",
        senderId: 'U123',
        senderName: 'John Smith',
        timestamp: '2024-01-21 11:00',
        isRead: false,
        isPIIMasked: false
      }
    ]
  },
  {
    id: 'T002',
    propertyId: 'L002',
    propertyTitle: 'Beachfront Apartment',
    propertyAddress: '15 Ocean View, North Ward',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop',
    sellerId: 'U124',
    sellerName: 'Sarah Johnson',
    lastMessage: "Here's my direct number: [PHONE MASKED]. Feel free to call me anytime!",
    lastMessageTime: '1 day ago',
    unreadCount: 0,
    contactShared: true,
    buyerConsent: true,
    sellerConsent: true,
    messages: [
      {
        id: 'M003',
        text: "I'd love to view this apartment. When would be a good time?",
        senderId: 'current-user',
        senderName: 'You',
        timestamp: '2024-01-20 14:00',
        isRead: true,
        isPIIMasked: false
      },
      {
        id: 'M004',
        text: "I'm available this weekend. Would Saturday at 2pm work for you?",
        senderId: 'U124',
        senderName: 'Sarah Johnson',
        timestamp: '2024-01-20 15:00',
        isRead: true,
        isPIIMasked: false
      },
      {
        id: 'M005',
        text: "Perfect! Can I get your contact number to confirm?",
        senderId: 'current-user',
        senderName: 'You',
        timestamp: '2024-01-20 15:30',
        isRead: true,
        isPIIMasked: false
      },
      {
        id: 'M006',
        text: "Here's my direct number: 0412 345 678. Feel free to call me anytime!",
        senderId: 'U124',
        senderName: 'Sarah Johnson',
        timestamp: '2024-01-20 16:00',
        isRead: true,
        isPIIMasked: false
      }
    ]
  }
]

export default function BuyerMessagesPage() {
  const [threads, setThreads] = useState(mockThreads)
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)

  const maskPII = (text: string): string => {
    // Mask phone numbers
    text = text.replace(/(\+?61|0)?4\d{2}\s?\d{3}\s?\d{3}/g, '[PHONE MASKED]')
    text = text.replace(/\d{2,4}\s?\d{3,4}\s?\d{3,4}/g, '[PHONE MASKED]')
    
    // Mask emails
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL MASKED]')
    
    return text
  }

  const sendMessage = () => {
    if (!selectedThread || !newMessage.trim()) return

    const message: Message = {
      id: `M${Date.now()}`,
      text: newMessage,
      senderId: 'current-user',
      senderName: 'You',
      timestamp: new Date().toLocaleString(),
      isRead: true,
      isPIIMasked: !selectedThread.contactShared
    }

    setThreads(threads.map(thread => {
      if (thread.id === selectedThread.id) {
        return {
          ...thread,
          messages: [...thread.messages, message],
          lastMessage: newMessage,
          lastMessageTime: 'Just now'
        }
      }
      return thread
    }))

    setSelectedThread({
      ...selectedThread,
      messages: [...selectedThread.messages, message],
      lastMessage: newMessage,
      lastMessageTime: 'Just now'
    })

    setNewMessage('')
  }

  const toggleContactSharing = () => {
    if (!selectedThread) return

    const updatedThread = {
      ...selectedThread,
      buyerConsent: !selectedThread.buyerConsent
    }

    // If both parties consent, share contact
    if (updatedThread.buyerConsent && updatedThread.sellerConsent) {
      updatedThread.contactShared = true
    }

    setThreads(threads.map(thread => 
      thread.id === selectedThread.id ? updatedThread : thread
    ))
    setSelectedThread(updatedThread)
    setShowContactModal(false)
  }

  const markAsRead = (threadId: string) => {
    setThreads(threads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          unreadCount: 0,
          messages: thread.messages.map(msg => ({ ...msg, isRead: true }))
        }
      }
      return thread
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl">BuySel</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/buyer/search" className="text-gray-700 hover:text-blue-600">
                Search Properties
              </Link>
              <Link href="/buyer/saved" className="text-gray-700 hover:text-blue-600">
                Saved
              </Link>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              <div className="divide-y">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setSelectedThread(thread)
                      markAsRead(thread.id)
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedThread?.id === thread.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={thread.propertyImage}
                        alt={thread.propertyTitle}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm truncate">{thread.propertyTitle}</p>
                            <p className="text-xs text-gray-600 truncate">{thread.sellerName}</p>
                          </div>
                          {thread.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {thread.contactShared ? thread.lastMessage : maskPII(thread.lastMessage)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{thread.lastMessageTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
                {/* Thread Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedThread.propertyImage}
                        alt={selectedThread.propertyTitle}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{selectedThread.propertyTitle}</h3>
                        <p className="text-sm text-gray-600">{selectedThread.propertyAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedThread.contactShared ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <Unlock className="h-4 w-4 mr-1" />
                          Contact Shared
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactModal(true)}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Share Contact
                        </Button>
                      )}
                      <Link href={`/property/${selectedThread.propertyId}`}>
                        <Button variant="outline" size="sm">
                          View Property
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderId === 'current-user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">
                          {selectedThread.contactShared ? message.text : maskPII(message.text)}
                        </p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'current-user' ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {!selectedThread.contactShared && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Contact details are hidden</p>
                          <p>Phone numbers and emails are masked for your safety. Click &ldquo;Share Contact&rdquo; when you&apos;re ready to exchange details.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Sharing Modal */}
        {showContactModal && selectedThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Share Contact Information</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    By sharing your contact information, the seller will be able to see your phone number and email address. Only share when you&apos;re comfortable doing so.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Your consent</span>
                    <span className={`text-sm ${selectedThread.buyerConsent ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedThread.buyerConsent ? 'Agreed' : 'Not yet'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Seller consent</span>
                    <span className={`text-sm ${selectedThread.sellerConsent ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedThread.sellerConsent ? 'Agreed' : 'Waiting'}
                    </span>
                  </div>
                </div>

                {selectedThread.sellerConsent && !selectedThread.buyerConsent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      The seller has already agreed to share their contact information. Once you agree, both parties will see each other&apos;s details.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowContactModal(false)}>
                  Cancel
                </Button>
                <Button onClick={toggleContactSharing}>
                  {selectedThread.buyerConsent ? 'Revoke Consent' : 'Share My Contact'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}