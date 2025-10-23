'use client'

import { useState, useEffect } from 'react'
import { User, Phone, MapPin, CheckCircle, XCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import type { Seller } from '@/types/seller'
import UserDetailsModal from '@/components/UserDetailsModal'

interface RecentActivity {
  id: string
  type: 'listing' | 'payment' | 'user' | 'dispute'
  description: string
  user: string
  timestamp: string
}

const recentActivities: RecentActivity[] = [
  { id: '1', type: 'listing', description: 'New listing created for 42 Sunset Drive', user: 'John Smith', timestamp: '2 hours ago' },
  { id: '2', type: 'payment', description: 'Payment received $500 - Listing fee', user: 'Sarah Johnson', timestamp: '3 hours ago' },
  { id: '3', type: 'user', description: 'New conveyancer registered', user: 'Legal Pro Services', timestamp: '5 hours ago' },
  { id: '4', type: 'dispute', description: 'Dispute opened - Listing accuracy', user: 'Michael Brown', timestamp: '1 day ago' },
  { id: '5', type: 'listing', description: 'Listing marked as sold', user: 'Emma Wilson', timestamp: '1 day ago' }
]

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('week')
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loadingSellers, setLoadingSellers] = useState(true)
  const [users, setUsers] = useState<Seller[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)

  useEffect(() => {
    fetchSellers()
    fetchUsers()
  }, [])

  const fetchSellers = async () => {
    try {
      setLoadingSellers(true)
      const response = await fetch('https://buysel.azurewebsites.net/api/user/sellers')
      if (response.ok) {
        const data: Seller[] = await response.json()
        setSellers(data)
      } else {
        console.error('Failed to fetch sellers')
      }
    } catch (error) {
      console.error('Error fetching sellers:', error)
    } finally {
      setLoadingSellers(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('https://buysel.azurewebsites.net/api/user')
      if (response.ok) {
        const data: Seller[] = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">BuySel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Admin User</span>
              <Link href="/" className="px-4 py-2 text-white border border-white rounded hover:bg-gray-800 inline-flex items-center">
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
              Overview
            </Link>
            <Link href="/admin/listings" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Listings
            </Link>
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/audit" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Audit Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Sellers Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Registered Sellers</h2>
            <span className="text-sm text-gray-600">{sellers.length} total</span>
          </div>

          {loadingSellers ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading sellers...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => setSelectedSeller(seller)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-400 relative"
                >
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {seller.photoazurebloburl && seller.photoazurebloburl.trim() !== '' && !seller.photoverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        Photo to be verified
                      </span>
                    )}
                    {seller.idbloburl && seller.idbloburl.trim() !== '' && !seller.idverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        ID to be verified
                      </span>
                    )}
                    {seller.ratesnotice && seller.ratesnotice.trim() !== '' && !seller.ratesnoticeverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        Rates to be verified
                      </span>
                    )}
                    {seller.titlesearch && seller.titlesearch.trim() !== '' && !seller.titlesearchverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        Title to be verified
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 rounded-full p-3 mr-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {seller.firstname} {seller.lastname}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{seller.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{seller.mobile}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{seller.address}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        {seller.idverified ? (
                          <span className="flex items-center text-xs text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-gray-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">ID: {seller.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Users Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
            <span className="text-sm text-gray-600">{users.length} total</span>
          </div>

          {loadingUsers ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading users...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedSeller(user)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-400 relative"
                >
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {user.photoazurebloburl && user.photoazurebloburl.trim() !== '' && !user.photoverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        Photo to be verified
                      </span>
                    )}
                    {user.idbloburl && user.idbloburl.trim() !== '' && !user.idverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        ID to be verified
                      </span>
                    )}
                    {user.ratesnotice && user.ratesnotice.trim() !== '' && !user.ratesnoticeverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        Rates to be verified
                      </span>
                    )}
                    {user.titlesearch && user.titlesearch.trim() !== '' && !user.titlesearchverified && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                        Title to be verified
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 rounded-full p-3 mr-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {user.firstname} {user.lastname}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.mobile}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.address}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        {user.idverified ? (
                          <span className="flex items-center text-xs text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-gray-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">ID: {user.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="p-6">
              
              <Link href="/admin/audit" className="w-full mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center justify-center">
                View Full Audit Log
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
         
        </div>
      </div>
      {/* User Detail Modal */}
      {selectedSeller && (
        <UserDetailsModal
          selectedSeller={selectedSeller}
          setSelectedSeller={setSelectedSeller}
          setSellers={setSellers}
          sellers={sellers}
          setUsers={setUsers}
          users={users}
        />
      )}
    </div>
  )
}