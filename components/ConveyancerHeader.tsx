'use client'

import Link from 'next/link'
import { User, LogOut, Menu, X, Briefcase, FileText, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Login from './Login'
import UserProfile from './UserProfile'

interface ConveyancerHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  isAuthenticated: boolean
}

export default function ConveyancerHeader({ user, isAuthenticated }: ConveyancerHeaderProps) {
  const { signOut: handleSignOut } = useAuth()
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigation = (url: string) => {
    setMobileMenuOpen(false)
    router.push(url)
  }

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/conveyancer" className="flex items-center group">
              <div className="h-16 w-16 sm:h-24 sm:w-24 mr-2 transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="BuySel Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl">BuySel</span>
                <span className="text-orange-400 text-sm font-medium">Conveyancer Portal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link href="/conveyancer" className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-gray-700">
                <Briefcase className="w-4 h-4" />
                <span>Overview</span>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/conveyancer/dashboard" className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-gray-700">
                    <FileText className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/conveyancer/jobs" className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] transition-all font-medium px-4 py-2 rounded-lg hover:bg-gray-700">
                    <FileText className="w-4 h-4" />
                    <span>My Jobs</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] px-3 py-2 rounded-lg transition-all hover:bg-gray-700"
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center ${user?.image ? 'hidden' : 'flex'}`}>
                      <User className="w-5 h-5 text-[#FF6600]" />
                    </div>
                    <span className="font-medium">{user?.name || user?.email}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] px-4 py-2.5 rounded-lg transition-all font-medium border border-gray-600 hover:border-[#FF6600] hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] px-4 py-2.5 rounded-lg transition-all font-medium border border-gray-600 hover:border-[#FF6600] hover:bg-gray-700"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}

              <div className="relative">
                <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-300 pointer-events-none" />
                <select
                  value="conveyancer"
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    if (selectedValue === 'conveyancer') return

                    if (selectedValue === 'buyer-seller') {
                      router.push('/')
                    } else if (selectedValue === 'admin') {
                      router.push('/admin/listings')
                    }
                  }}
                  className="pl-10 pr-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white border border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium cursor-pointer hover:from-orange-700 hover:to-orange-800 transition-all appearance-none"
                >
                  <option value="buyer-seller">Buyer/Seller</option>
                  <option value="conveyancer">Conveyancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-1"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center ${user?.image ? 'hidden' : 'flex'}`}>
                    <User className="w-5 h-5 text-[#FF6600]" />
                  </div>
                  <span className="text-xs font-medium text-white max-w-[80px] truncate">{user?.name || user?.email}</span>
                </button>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => setShowLogin(true)}
                  className="p-2 rounded-lg text-gray-200 hover:text-[#FF6600] hover:bg-gray-700 transition-all"
                >
                  <User className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-200 hover:text-[#FF6600] hover:bg-gray-700 transition-all"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 pb-4">
              <nav className="flex flex-col space-y-1 mt-4">
                <Link
                  href="/conveyancer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] transition-all font-medium px-4 py-3 rounded-lg hover:bg-gray-700"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/conveyancer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] transition-all font-medium px-4 py-3 rounded-lg hover:bg-gray-700"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/conveyancer/jobs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] transition-all font-medium px-4 py-3 rounded-lg hover:bg-gray-700"
                    >
                      <FileText className="w-4 h-4" />
                      <span>My Jobs</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowProfile(true)
                      }}
                      className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] px-4 py-3 rounded-lg transition-all hover:bg-gray-700 text-left"
                    >
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center ${user?.image ? 'hidden' : 'flex'}`}>
                        <User className="w-4 h-4 text-[#FF6600]" />
                      </div>
                      <span className="font-medium">{user?.name || user?.email}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] px-4 py-3 rounded-lg transition-all hover:bg-gray-700 text-left"
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
                    className="flex items-center gap-2 text-gray-200 hover:text-[#FF6600] px-4 py-3 rounded-lg transition-all hover:bg-gray-700 text-left"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}

                <div className="px-4 py-2">
                  <div className="relative">
                    <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-300 pointer-events-none" />
                    <select
                      value="conveyancer"
                      onChange={(e) => {
                        const selectedValue = e.target.value
                        if (selectedValue === 'conveyancer') return

                        if (selectedValue === 'buyer-seller') {
                          handleNavigation('/')
                        } else if (selectedValue === 'admin') {
                          handleNavigation('/admin/listings')
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white border border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium cursor-pointer hover:from-orange-700 hover:to-orange-800 transition-all"
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
      {showLogin && <Login onClose={() => setShowLogin(false)} callbackUrl="/conveyancer" />}
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
