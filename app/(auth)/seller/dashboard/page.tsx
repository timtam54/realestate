'use client'

import { useState, useEffect } from 'react'
import { Plus, Home, Eye, MessageSquare, Edit, Pause, TrendingUp, DollarSign, Calendar, BarChart3, X, Bed, Bath, Car } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/components/Login'

interface Listing {
  id: string
  title: string
  address: string
  suburb?: string
  state?: string
  postcode?: string
  price: number
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  carSpaces?: number
  landSize?: number
  description?: string
  features?: string[]
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
    suburb: 'Edge Hill',
    state: 'QLD',
    postcode: '4870',
    price: 750000,
    propertyType: 'house',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSize: 800,
    description: 'Beautiful modern family home with stunning views and spacious living areas. Perfect for growing families.',
    features: ['Pool', 'Air Conditioning', 'Solar Panels', 'Security System'],
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
    suburb: 'Townsville',
    state: 'QLD',
    postcode: '4810',
    price: 425000,
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    carSpaces: 1,
    description: 'Great investment opportunity in the heart of Townsville. Currently tenanted with excellent rental returns.',
    features: ['Balcony', 'City Views', 'Secure Parking'],
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
  const { isAuthenticated, isLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [listings, setListings] = useState(mockListings)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [formData, setFormData] = useState<Partial<Listing>>({})
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLogin(true)
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600]"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        {showLogin && <Login onClose={() => window.location.href = '/'} />}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#333333] mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your seller dashboard</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-[#FF6600] text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </>
    )
  }

  const availableFeatures = [
    'Pool', 'Air Conditioning', 'Solar Panels', 'Security System',
    'Balcony', 'Garden', 'Garage', 'Dishwasher', 'Study',
    'Ensuite', 'Built-in Robes', 'Courtyard', 'Deck', 'Heating'
  ]

  const openEditDialog = (listing: Listing) => {
    setEditingListing(listing)
    setFormData(listing)
    setSelectedFeatures(listing.features || [])
  }

  const closeEditDialog = () => {
    setEditingListing(null)
    setFormData({})
    setSelectedFeatures([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'carSpaces' || name === 'landSize' 
        ? parseInt(value) || 0 
        : value
    }))
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleSave = () => {
    if (editingListing) {
      setListings(prev =>
        prev.map(listing =>
          listing.id === editingListing.id
            ? { ...listing, ...formData, features: selectedFeatures }
            : listing
        )
      )
      closeEditDialog()
    }
  }

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
              <span className="font-bold text-xl">BuySel</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/seller/messages" className="text-gray-700 hover:text-blue-600 flex items-center">
                <MessageSquare className="h-5 w-5 mr-1" />
                Messages
              </Link>
              <Link href="/seller/list-property" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Link>
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
                  <tr key={listing.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEditDialog(listing)}>
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
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(listing)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={(e) => e.stopPropagation()}
                        >
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
              <p className="text-gray-500 mb-4">You don&apos;t have any listings yet</p>
              <Link href="/seller/list-property" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>

        {/* Edit Listing Dialog */}
        {editingListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Edit Listing</h2>
                  <button
                    onClick={closeEditDialog}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                      </label>
                      <select
                        name="propertyType"
                        value={formData.propertyType || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="land">Land</option>
                        <option value="rural">Rural</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Suburb
                      </label>
                      <input
                        type="text"
                        name="suburb"
                        value={formData.suburb || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select state</option>
                        <option value="QLD">Queensland</option>
                        <option value="NSW">New South Wales</option>
                        <option value="VIC">Victoria</option>
                        <option value="SA">South Australia</option>
                        <option value="WA">Western Australia</option>
                        <option value="TAS">Tasmania</option>
                        <option value="NT">Northern Territory</option>
                        <option value="ACT">ACT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postcode
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={formData.postcode || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Features..</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Bed className="inline h-4 w-4 mr-1" />
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms || ''}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Bath className="inline h-4 w-4 mr-1" />
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms || ''}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Car className="inline h-4 w-4 mr-1" />
                        Car Spaces
                      </label>
                      <input
                        type="number"
                        name="carSpaces"
                        value={formData.carSpaces || ''}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Home className="inline h-4 w-4 mr-1" />
                        Land Size (m²)
                      </label>
                      <input
                        type="number"
                        name="landSize"
                        value={formData.landSize || ''}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableFeatures.map((feature) => (
                        <label
                          key={feature}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asking Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price || ''}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Listing Status
                      </label>
                      <select
                        name="status"
                        value={formData.status || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                        <option value="live">Live</option>
                        <option value="paused">Paused</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your property..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button type="button" onClick={closeEditDialog} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}