'use client'

import Link from 'next/link'
import { Shield, FileText, Users, FolderOpen, Activity, User, LogOut, Menu, X, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import UserProfile from './UserProfile'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  isAuthenticated: boolean
}

export default function AdminHeader({ user, isAuthenticated }: AdminHeaderProps) {
  const { signOut: handleSignOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin/listings', label: 'Listings', icon: FolderOpen },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/document-requests', label: 'Doc Requests', icon: FileText },
    { href: '/admin/audit', label: 'Audit', icon: Activity }
  ]

  const isActiveRoute = (href: string) => pathname === href

  const currentMode = 'admin'

  const handleNavigation = (url: string) => {
    router.push(url)
  }

  return (
    <>
      <header className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <Link href="/admin/listings" className="flex items-center group">
              <div className="bg-yellow-500 p-2 rounded-lg mr-3 group-hover:bg-yellow-400 transition-colors">
                <Shield className="h-6 w-6 text-indigo-900" />
              </div>
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-xs text-blue-200 block hidden sm:block">BuySel Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-white/20 text-white border-b-2 border-yellow-400'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full border-2 border-yellow-400"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-yellow-300">
                        <User className="w-5 h-5 text-indigo-900" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                  </button>
                  <button
                    onClick={() => handleSignOut()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
                >
                  Back to Home
                </Link>
              )}

              {/* Mode Switcher - Far Right */}
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-700 pointer-events-none" />
                <select
                  value={currentMode}
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    if (selectedValue === currentMode) return

                    if (selectedValue === 'conveyancer') {
                      handleNavigation('/conveyancer')
                    } else if (selectedValue === 'buyer-seller') {
                      handleNavigation('/')
                    }
                    // Admin is already selected, no action needed
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium cursor-pointer hover:from-blue-200 hover:to-blue-300 transition-all"
                >
                  <option value="buyer-seller">Buyer/Seller</option>
                  <option value="conveyancer">Conveyancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-white/20 text-white border-l-4 border-yellow-400'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* Mobile User Section */}
              <div className="border-t border-white/10 pt-3 mt-3">
                {isAuthenticated && user ? (
                  <>
                    <button
                      onClick={() => {
                        setShowProfile(true)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full border-2 border-yellow-400"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-yellow-300">
                          <User className="w-6 h-6 text-indigo-900" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{user.name || 'Admin'}</div>
                        <div className="text-sm text-blue-200">{user.email}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-medium mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
                  >
                    Back to Home
                  </Link>
                )}
              </div>

              {/* Mobile Mode Switcher - At Bottom */}
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-700 pointer-events-none" />
                  <select
                    value={currentMode}
                    onChange={(e) => {
                      const selectedValue = e.target.value
                      if (selectedValue === currentMode) return

                      if (selectedValue === 'conveyancer') {
                        handleNavigation('/conveyancer')
                      } else if (selectedValue === 'buyer-seller') {
                        handleNavigation('/')
                      }
                      // Admin is already selected, no action needed
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium cursor-pointer hover:from-blue-200 hover:to-blue-300 transition-all"
                  >
                    <option value="buyer-seller">Buyer/Seller</option>
                    <option value="conveyancer">Conveyancer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* User Profile Modal */}
      {showProfile && user?.email && (
        <UserProfile
          email={user.email}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  )
}
