'use client'

import { useState } from 'react'
import { Home, Eye, Pause, Trash2, Star, AlertCircle, CheckCircle, Clock, Search, Filter, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

interface Listing {
  id: string
  title: string
  address: string
  suburb: string
  price: number
  seller: {
    name: string
    email: string
    id: string
  }
  status: 'draft' | 'review' | 'live' | 'paused' | 'archived' | 'sold'
  featured: boolean
  views: number
  inquiries: number
  badges: string[]
  createdAt: string
  updatedAt: string
  revenue: number
}

const mockListings: Listing[] = [
  {
    id: 'L001',
    title: 'Modern Family Home in Edge Hill',
    address: '42 Sunset Drive',
    suburb: 'Edge Hill',
    price: 750000,
    seller: { name: 'John Smith', email: 'john@email.com', id: 'U123' },
    status: 'live',
    featured: true,
    views: 1234,
    inquiries: 23,
    badges: ['contract', 'smoke_alarm', 'building_pest', 'pro_photos'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    revenue: 500
  },
  {
    id: 'L002',
    title: 'Beachfront Apartment',
    address: '15 Ocean View',
    suburb: 'North Ward',
    price: 450000,
    seller: { name: 'Sarah Johnson', email: 'sarah@email.com', id: 'U124' },
    status: 'live',
    featured: false,
    views: 856,
    inquiries: 12,
    badges: ['contract', 'smoke_alarm'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19',
    revenue: 500
  },
  {
    id: 'L003',
    title: 'Rural Property with Acreage',
    address: '200 Country Lane',
    suburb: 'Charters Towers',
    price: 550000,
    seller: { name: 'Michael Brown', email: 'michael@email.com', id: 'U125' },
    status: 'review',
    featured: false,
    views: 0,
    inquiries: 0,
    badges: ['contract'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    revenue: 0
  }
]

export default function AdminListingsPage() {
  const [listings, setListings] = useState(mockListings)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{type: string, listing: Listing} | null>(null)

  const filteredListings = listings.filter(listing => {
    if (filterStatus !== 'all' && listing.status !== filterStatus) return false
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.suburb.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleFeatureToggle = (listingId: string) => {
    setListings(listings.map(l => 
      l.id === listingId ? { ...l, featured: !l.featured } : l
    ))
    setShowActionMenu(null)
  }

  const handleStatusChange = (listingId: string, newStatus: Listing['status']) => {
    setListings(listings.map(l => 
      l.id === listingId ? { ...l, status: newStatus } : l
    ))
    setShowConfirmDialog(null)
  }

  const handleUnlist = (listing: Listing) => {
    setShowConfirmDialog({ type: 'unlist', listing })
  }

  const confirmUnlist = () => {
    if (showConfirmDialog && showConfirmDialog.listing) {
      handleStatusChange(showConfirmDialog.listing.id, 'archived')
      // Log audit action
      console.log(`Audit Log: Admin unlisted property ${showConfirmDialog.listing.id}`)
    }
  }

  const stats = {
    total: listings.length,
    live: listings.filter(l => l.status === 'live').length,
    review: listings.filter(l => l.status === 'review').length,
    revenue: listings.reduce((acc, l) => acc + l.revenue, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">Listings Management</span>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white hover:bg-gray-800" asChild>
              <Link href="/admin/dashboard">Back to Overview</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Overview
            </Link>
            <Link href="/admin/listings" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
              Listings
            </Link>
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/partners" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Partners
            </Link>
            <Link href="/admin/payments" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Payments
            </Link>
            <Link href="/admin/cms" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              CMS
            </Link>
            <Link href="/admin/audit" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Audit Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Listings</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Live Listings</p>
            <p className="text-2xl font-bold text-green-600">{stats.live}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-2xl font-bold text-orange-600">{stats.review}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.revenue}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="live">Live</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
                <option value="sold">Sold</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                        {listing.featured && (
                          <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{listing.address}, {listing.suburb}</p>
                      <p className="text-sm font-semibold">${listing.price.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{listing.seller.name}</p>
                      <p className="text-sm text-gray-500">{listing.seller.email}</p>
                      <Link href={`/admin/users/${listing.seller.id}`} className="text-xs text-blue-600 hover:underline">
                        View Profile
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.status === 'live' ? 'bg-green-100 text-green-800' :
                      listing.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      listing.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                      listing.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1 text-gray-400" />
                        {listing.views}
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1 text-gray-400" />
                        {listing.inquiries}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {listing.badges.map((badge) => (
                        <span key={badge} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${listing.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === listing.id ? null : listing.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showActionMenu === listing.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                          <Link
                            href={`/property/${listing.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 inline mr-2" />
                            View Listing
                          </Link>
                          <Link
                            href={`/admin/audit?filter=listing:${listing.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Clock className="h-4 w-4 inline mr-2" />
                            View Audit Trail
                          </Link>
                          <button
                            onClick={() => handleFeatureToggle(listing.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Star className="h-4 w-4 inline mr-2" />
                            {listing.featured ? 'Unfeature' : 'Feature'} Listing
                          </button>
                          {listing.status === 'live' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(listing.id, 'paused')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Pause className="h-4 w-4 inline mr-2" />
                                Pause Listing
                              </button>
                              <button
                                onClick={() => handleUnlist(listing)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                <Trash2 className="h-4 w-4 inline mr-2" />
                                Unlist Property
                              </button>
                            </>
                          )}
                          {listing.status === 'paused' && (
                            <button
                              onClick={() => handleStatusChange(listing.id, 'live')}
                              className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                            >
                              <CheckCircle className="h-4 w-4 inline mr-2" />
                              Activate Listing
                            </button>
                          )}
                          {listing.status === 'review' && (
                            <button
                              onClick={() => handleStatusChange(listing.id, 'live')}
                              className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                            >
                              <CheckCircle className="h-4 w-4 inline mr-2" />
                              Approve Listing
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to unlist &ldquo;{showConfirmDialog.listing.title}&rdquo;? This action will be logged in the audit trail.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowConfirmDialog(null)}>
                  Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={confirmUnlist}>
                  Unlist Property
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}