'use client'

import { useState, useEffect } from 'react'
import { Home, Eye, Pause, Trash2, Star, AlertCircle, CheckCircle, Clock, Search, Filter, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { getAzureBlobUrl } from '@/lib/config'

interface Property {
  id: number
  title: string
  address: string
  suburb: string
  postcode: string
  state: string
  country: string
  price: number
  photobloburl: string
  typeofprop: string | null
  beds: number
  baths: number
  carspaces: number
  landsize: number
  buildyear: number
  lat: number
  lon: number
  dte: string | null
  sellerid: number
  buildinginspazureblob: string | null
  buildinginspverified: boolean | null
  pestinspazureblob: string | null
  pestinspverified: boolean | null
  titlesrchcouncilrateazureblob: string | null
  titlesrchcouncilrateverified: boolean | null
}

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
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(mockListings)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{type: string, listing: Listing} | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://buysel.azurewebsites.net/api/property')
      if (response.ok) {
        const data: Property[] = await response.json()
        setProperties(data)
      } else {
        console.error('Failed to fetch properties')
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filterStatus !== 'all' && listing.status !== filterStatus) return false
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.suburb.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

 

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

  const handleVerificationToggle = async (propertyId: number, field: 'buildinginspverified' | 'pestinspverified' | 'titlesrchcouncilrateverified') => {
    if (!selectedProperty) return

    const newValue = !selectedProperty[field]

    try {
      const updatedProperty = { ...selectedProperty, [field]: newValue }

      const response = await fetch('https://buysel.azurewebsites.net/api/property', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProperty),
      })

      if (response.ok) {
        setSelectedProperty(updatedProperty)
        setProperties(properties.map(p => p.id === propertyId ? updatedProperty : p))
        console.log(`Audit Log: Admin ${newValue ? 'verified' : 'unverified'} ${field} for property ${propertyId}`)
      }
    } catch (error) {
      console.error('Error updating verification:', error)
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
            <Link href="/admin/dashboard" className="px-4 py-2 text-white border border-white rounded hover:bg-gray-800 inline-flex items-center">
              Back to Overview
            </Link>
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
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading properties...</span>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {property.photobloburl ? (
                        <img
                          src={getAzureBlobUrl(property.photobloburl)}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Home className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-500">{property.address}</p>
                        <p className="text-sm font-semibold text-blue-600">${property.price.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <p>{property.typeofprop || 'N/A'}</p>
                        <p>{property.beds} bed · {property.baths} bath · {property.carspaces} car</p>
                        <p>{property.landsize}m² · Built {property.buildyear}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">Seller #{property.sellerid}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {property.dte ? new Date(property.dte).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {property.titlesrchcouncilrateazureblob && !property.titlesrchcouncilrateverified && (
                          <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded inline-block">
                            Title Search/Council Rates to be verified
                          </div>
                        )}
                        {property.buildinginspazureblob && !property.buildinginspverified && (
                          <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded inline-block">
                            Building Inspection to be verified
                          </div>
                        )}
                        {property.pestinspazureblob && !property.pestinspverified && (
                          <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded inline-block">
                            Pest Inspection to be verified
                          </div>
                        )}
                        {(!property.titlesrchcouncilrateazureblob || property.titlesrchcouncilrateverified) &&
                         (!property.buildinginspazureblob || property.buildinginspverified) &&
                         (!property.pestinspazureblob || property.pestinspverified) && (
                          <p className="text-sm text-gray-500">All verified</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        href={`/property/${property.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedProperty(property)
                          setShowDocumentsModal(true)
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Verify Docs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50" onClick={() => setShowConfirmDialog(null)}>
                  Cancel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={confirmUnlist}>
                  Unlist Property
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Verification Modal */}
        {showDocumentsModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Verify Documents - {selectedProperty.title}</h3>
                <button onClick={() => setShowDocumentsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title Search/Council Rates Document */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Title Search or Council Rates Notice</h4>
                    {selectedProperty.titlesrchcouncilrateazureblob && (
                      <button
                        onClick={() => handleVerificationToggle(selectedProperty.id, 'titlesrchcouncilrateverified')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          selectedProperty.titlesrchcouncilrateverified
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedProperty.titlesrchcouncilrateverified ? '✓ Verified' : 'Mark as Verified'}
                      </button>
                    )}
                  </div>
                  {selectedProperty.titlesrchcouncilrateazureblob ? (
                    <div className="bg-gray-50 rounded p-2">
                      <iframe
                        src={getAzureBlobUrl(selectedProperty.titlesrchcouncilrateazureblob) || ''}
                        className="w-full h-96 rounded"
                        title="Title Search or Council Rates"
                      />
                      <button
                        onClick={() => window.open(getAzureBlobUrl(selectedProperty.titlesrchcouncilrateazureblob!) || '', '_blank')}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No document uploaded</p>
                  )}
                </div>

                {/* Building Inspection Report */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Building Inspection Report</h4>
                    {selectedProperty.buildinginspazureblob && (
                      <button
                        onClick={() => handleVerificationToggle(selectedProperty.id, 'buildinginspverified')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          selectedProperty.buildinginspverified
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedProperty.buildinginspverified ? '✓ Verified' : 'Mark as Verified'}
                      </button>
                    )}
                  </div>
                  {selectedProperty.buildinginspazureblob ? (
                    <div className="bg-gray-50 rounded p-2">
                      <iframe
                        src={getAzureBlobUrl(selectedProperty.buildinginspazureblob) || ''}
                        className="w-full h-96 rounded"
                        title="Building Inspection"
                      />
                      <button
                        onClick={() => window.open(getAzureBlobUrl(selectedProperty.buildinginspazureblob!) || '', '_blank')}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No document uploaded</p>
                  )}
                </div>

                {/* Pest Inspection Report */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Pest Inspection Report</h4>
                    {selectedProperty.pestinspazureblob && (
                      <button
                        onClick={() => handleVerificationToggle(selectedProperty.id, 'pestinspverified')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          selectedProperty.pestinspverified
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedProperty.pestinspverified ? '✓ Verified' : 'Mark as Verified'}
                      </button>
                    )}
                  </div>
                  {selectedProperty.pestinspazureblob ? (
                    <div className="bg-gray-50 rounded p-2">
                      <iframe
                        src={getAzureBlobUrl(selectedProperty.pestinspazureblob) || ''}
                        className="w-full h-96 rounded"
                        title="Pest Inspection"
                      />
                      <button
                        onClick={() => window.open(getAzureBlobUrl(selectedProperty.pestinspazureblob!) || '', '_blank')}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No document uploaded</p>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                <button
                  onClick={() => setShowDocumentsModal(false)}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}