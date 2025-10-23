'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Home, User, Search, Briefcase, Settings, LogOut, Menu, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import Login from './Login'
import UserProfile from './UserProfile'
import UnreadMessagesIndicator from './UnreadMessagesIndicator'
import ChatModal from './ChatModal'
import { Property } from '@/types/property'

interface BuySelHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  isAuthenticated: boolean
}

export default function BuySelHeader({ user, isAuthenticated }: BuySelHeaderProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [chatProperty, setChatProperty] = useState<Property | null>(null)
  const [chatConversationId, setChatConversationId] = useState<string | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleNavigation = (url: string) => {
    setMobileMenuOpen(false)
    window.location.href = url
  }
  
  return (
    <>
      <header className="bg-gradient-to-r from-orange-50 via-white to-orange-50 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center group">
            <div className="relative h-16 w-16 sm:h-24 sm:w-24 mr-2 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="BuySel Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/" className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-orange-50">
              <Search className="w-4 h-4" />
              <span><u>Buy</u></span>
            </Link>
            <Link href="/seller" className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-orange-50">
              <Home className="w-4 h-4" />
              <span><u>Sell</u></span>
            </Link>
            <Link href="/how-it-works" className="flex items-center gap-2 text-[#000000] hover:text-[#FF6600] transition-all font-semibold px-4 py-2 rounded-lg hover:bg-orange-50">
              <Briefcase className="w-4 h-4" />
              <span><u>How it Works</u></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && (
              <UnreadMessagesIndicator 
                onOpenChat={async (propertyId, conversationId) => {
                  try {
                    const response = await fetch(`https://buysel.azurewebsites.net/api/property/${propertyId}`)
                    if (response.ok) {
                      const property = await response.json()
                      setChatProperty(property)
                      setChatConversationId(conversationId)
                      setShowChatModal(true)
                    }
                  } catch (error) {
                    console.error('Failed to fetch property:', error)
                  }
                }}
              />
            )}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-3 py-2 rounded-lg transition-all hover:bg-orange-50"
                >
                  {user?.image && (
                    <img 
                      src={user.image} 
                      alt={user.name || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="font-medium">{user?.name || user?.email}</span>
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-4 py-2.5 rounded-lg transition-all font-medium border border-gray-300 hover:border-[#FF6600] hover:bg-orange-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-4 py-2.5 rounded-lg transition-all font-medium border border-gray-300 hover:border-[#FF6600] hover:bg-orange-50"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
            
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-700 pointer-events-none" />
              <select 
                onChange={(e) => {
                  if (e.target.value === 'seller') {
                    window.location.href = '/seller'
                  } else if (e.target.value === 'conveyancer') {
                    window.location.href = '/conveyancer/queue'
                  } else if (e.target.value === 'admin') {
                    window.location.href = '/admin/dashboard'
                  }
                }}
                className="pl-10 pr-4 py-2.5 bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 font-medium cursor-pointer hover:from-red-200 hover:to-red-300 transition-all appearance-none"
              >
                <option value="buyer-seller">Buyer/Seller</option>
                <option value="conveyancer">Conveyancer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <>
                <UnreadMessagesIndicator 
                  onOpenChat={async (propertyId, conversationId) => {
                    try {
                      const response = await fetch(`https://buysel.azurewebsites.net/api/property/${propertyId}`)
                      if (response.ok) {
                        const property = await response.json()
                        setChatProperty(property)
                        setChatConversationId(conversationId)
                        setShowChatModal(true)
                      }
                    } catch (error) {
                      console.error('Failed to fetch property:', error)
                    }
                  }}
                />
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-1"
                >
                  {user?.image && (
                    <img 
                      src={user.image} 
                      alt={user.name || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-xs font-medium text-[#333333] max-w-[80px] truncate">{user?.name || user?.email}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="p-2 rounded-lg text-[#333333] hover:text-[#FF6600] hover:bg-orange-50 transition-all"
              >
                <User className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#333333] hover:text-[#FF6600] hover:bg-orange-50 transition-all"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pb-4">
            <nav className="flex flex-col space-y-1 mt-4">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-3 rounded-lg hover:bg-orange-50"
              >
                <Search className="w-4 h-4" />
                <span>Buy</span>
              </Link>
              <Link 
                href="/seller" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] transition-all font-medium px-4 py-3 rounded-lg hover:bg-orange-50"
              >
                <Home className="w-4 h-4" />
                <span>Sell</span>
              </Link>
              <Link 
                href="/how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[#000000] hover:text-[#FF6600] transition-all font-semibold px-4 py-3 rounded-lg hover:bg-orange-50"
              >
                <Briefcase className="w-4 h-4" />
                <span>How it Works</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setShowProfile(true)
                    }}
                    className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-4 py-3 rounded-lg transition-all hover:bg-orange-50 text-left"
                  >
                    {user?.image && (
                      <img 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{user?.name || user?.email}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-4 py-3 rounded-lg transition-all hover:bg-orange-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowLogin(true)
                  }}
                  className="flex items-center gap-2 text-[#333333] hover:text-[#FF6600] px-4 py-3 rounded-lg transition-all hover:bg-orange-50 text-left"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
              
              <div className="px-4 py-2">
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-700 pointer-events-none" />
                  <select 
                    onChange={(e) => {
                      if (e.target.value === 'seller') {
                        handleNavigation('/seller')
                      } else if (e.target.value === 'conveyancer') {
                        handleNavigation('/conveyancer/queue')
                      } else if (e.target.value === 'admin') {
                        handleNavigation('/admin/dashboard')
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 font-medium cursor-pointer hover:from-red-200 hover:to-red-300 transition-all"
                  >
                    <option value="buyer-seller">Buyer/Seller</option>
                    <option value="conveyancer">Conveyancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showProfile && user?.email && (
        <UserProfile
          email={user.email}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
      {showChatModal && chatProperty && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false)
            setChatProperty(null)
            setChatConversationId(null)
          }}
          property={chatProperty}
          currentUserId={0}
          initialConversationId={chatConversationId}
        />
      )}
    </>
  )
}
