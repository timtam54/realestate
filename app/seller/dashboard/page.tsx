'use client'

import { useState } from 'react'
import { Plus, Home, Eye, MessageSquare, Edit, Pause, Archive, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

interface Listing {
  id: string
  title: string
  address: string
  price: number
  status: 'draft' | 'review' | 'live' | 'paused' | 'sold'
  views: number
  inquiries: number
  created: string
  image: string
}

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Modern Family Home in Edge Hill',
    address: '42 Sunset Drive, Edge Hill',
    price: 750000,
    status: 'live',
    views: 234,
    inquiries: 12,
    created: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&h=150&fit=crop'
  },
  {
    id: '2',
    title: 'Investment Property in Townsville',
    address: '88 Harbor View, Townsville',
    price: 425000,
    status: 'draft',
    views: 0,
    inquiries: 0,
    created: '2024-01-20',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&h=150&fit=crop'
  }
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  live: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  sold: 'bg-blue-100 text-blue-800'
}

export default function SellerDashboardPage() {
  const [listings, setListings] = useState(mockListings)

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'live').length,
    totalViews: listings.reduce((acc, l) => acc + l.views, 0),
    totalInquiries: listings.reduce((acc, l) => acc + l.inquiries, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl">Real Estate Matchmaker</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/seller/messages" className="text-gray-700 hover:text-blue-600 flex items-center">
                <MessageSquare className="h-5 w-5 mr-1" />
                Messages
              </Link>
              <Button asChild>
                <Link href="/seller/list-property">
                  <Plus className="h-4 w-4 mr-2" />
                  New Listing
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your property listings and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-semibold">{stats.totalListings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-semibold">{stats.activeListings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold">{stats.totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="text-2xl font-semibold">{stats.totalInquiries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/seller/list-property" className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-400 transition-colors">
              <Plus className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Create New Listing</h3>
              <p className="text-sm text-gray-600">Start listing a new property</p>
            </Link>
            
            <Link href="/seller/pricing" className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-400 transition-colors">
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold">Pricing Guide</h3>
              <p className="text-sm text-gray-600">Get help pricing your property</p>
            </Link>
            
            <Link href="/seller/calendar" className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-400 transition-colors">
              <Calendar className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">Inspection Calendar</h3>
              <p className="text-sm text-gray-600">Manage property viewings</p>
            </Link>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Listings</h2>
              <div className="flex space-x-2">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                  <option>Live</option>
                  <option>Draft</option>
                  <option>Paused</option>
                  <option>Sold</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inquiries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={listing.image}
                          alt={listing.title}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[listing.status]}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Eye className="h-4 w-4 mr-1 text-gray-400" />
                        {listing.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                        {listing.inquiries}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(listing.created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-orange-600 hover:text-orange-900">
                          <Pause className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {listings.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You don't have any listings yet</p>
              <Button asChild>
                <Link href="/seller/list-property">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}