'use client'

import { useState } from 'react'
import { Users, FileText, Camera, Shield, CheckCircle, XCircle, Clock, Edit, DollarSign, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Partner {
  id: string
  businessName: string
  abn: string
  contactName: string
  contactEmail: string
  contactPhone: string
  type: 'conveyancer' | 'inspector' | 'photographer'
  status: 'pending' | 'active' | 'paused' | 'rejected'
  commissionRate: number
  servicesOffered: string[]
  serviceAreas: string[]
  licenseNumber?: string
  licenseExpiry?: string
  insuranceProvider?: string
  insuranceExpiry?: string
  rating: number
  totalJobs: number
  revenue: number
  joinedDate: string
  documents: {
    type: string
    url: string
    verified: boolean
  }[]
}

const mockPartners: Partner[] = [
  {
    id: 'P001',
    businessName: 'Smith & Co Conveyancers',
    abn: '12 345 678 901',
    contactName: 'Jane Smith',
    contactEmail: 'jane@smithconveyancers.com.au',
    contactPhone: '0412 345 678',
    type: 'conveyancer',
    status: 'active',
    commissionRate: 20,
    servicesOffered: ['Contract of Sale', 'Title Search', 'Settlement'],
    serviceAreas: ['Townsville', 'Edge Hill', 'North Ward'],
    licenseNumber: 'QLD-CONV-12345',
    licenseExpiry: '2025-12-31',
    insuranceProvider: 'Professional Indemnity Co',
    insuranceExpiry: '2024-12-31',
    rating: 4.8,
    totalJobs: 45,
    revenue: 4500,
    joinedDate: '2023-06-15',
    documents: [
      { type: 'License', url: '#', verified: true },
      { type: 'Insurance', url: '#', verified: true },
      { type: 'ABN', url: '#', verified: true }
    ]
  },
  {
    id: 'P002',
    businessName: 'North QLD Building Inspections',
    abn: '23 456 789 012',
    contactName: 'Mark Johnson',
    contactEmail: 'mark@nqbuilding.com.au',
    contactPhone: '0423 456 789',
    type: 'inspector',
    status: 'active',
    commissionRate: 15,
    servicesOffered: ['Building Inspection', 'Pest Inspection', 'Pool Safety'],
    serviceAreas: ['Townsville', 'Charters Towers', 'Ayr', 'Ingham'],
    licenseNumber: 'QBCC-98765',
    licenseExpiry: '2025-06-30',
    insuranceProvider: 'Trade Insurance Co',
    insuranceExpiry: '2024-09-30',
    rating: 4.6,
    totalJobs: 78,
    revenue: 35100,
    joinedDate: '2023-08-20',
    documents: [
      { type: 'License', url: '#', verified: true },
      { type: 'Insurance', url: '#', verified: true }
    ]
  },
  {
    id: 'P003',
    businessName: 'Coastal Real Estate Photography',
    abn: '34 567 890 123',
    contactName: 'Lisa Chen',
    contactEmail: 'lisa@coastalphotos.com.au',
    contactPhone: '0434 567 890',
    type: 'photographer',
    status: 'pending',
    commissionRate: 25,
    servicesOffered: ['Photography', 'Drone Photography', 'Virtual Tours'],
    serviceAreas: ['Townsville', 'Magnetic Island'],
    rating: 0,
    totalJobs: 0,
    revenue: 0,
    joinedDate: '2024-01-20',
    documents: [
      { type: 'ABN', url: '#', verified: true },
      { type: 'Portfolio', url: '#', verified: false }
    ]
  }
]

interface EditCommissionModalProps {
  partner: Partner
  onClose: () => void
  onSave: (partnerId: string, newRate: number) => void
}

function EditCommissionModal({ partner, onClose, onSave }: EditCommissionModalProps) {
  const [rate, setRate] = useState(partner.commissionRate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Edit Commission Rate</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Partner</p>
            <p className="font-medium">{partner.businessName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              Current revenue share: ${(partner.revenue * (partner.commissionRate / 100)).toFixed(2)}
            </p>
            <p className="text-sm text-blue-800">
              New revenue share: ${(partner.revenue * (rate / 100)).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => {
            onSave(partner.id, rate)
            onClose()
          }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState(mockPartners)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  const filteredPartners = partners.filter(partner => {
    if (filterType !== 'all' && partner.type !== filterType) return false
    if (filterStatus !== 'all' && partner.status !== filterStatus) return false
    return true
  })

  const handleStatusChange = (partnerId: string, newStatus: Partner['status']) => {
    setPartners(partners.map(p => 
      p.id === partnerId ? { ...p, status: newStatus } : p
    ))
    // Log audit action
    console.log(`Audit Log: Admin changed partner ${partnerId} status to ${newStatus}`)
  }

  const handleCommissionChange = (partnerId: string, newRate: number) => {
    setPartners(partners.map(p => 
      p.id === partnerId ? { ...p, commissionRate: newRate } : p
    ))
    // Log audit action
    console.log(`Audit Log: Admin changed partner ${partnerId} commission rate to ${newRate}%`)
  }

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    pending: partners.filter(p => p.status === 'pending').length,
    revenue: partners.reduce((sum, p) => sum + p.revenue, 0)
  }

  const partnerTypeIcons = {
    conveyancer: FileText,
    inspector: Shield,
    photographer: Camera
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">Partner Management</span>
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
            <Link href="/admin/listings" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Listings
            </Link>
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/partners" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
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
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Partners</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active Partners</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Partner Revenue</p>
            <p className="text-2xl font-bold">${stats.revenue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="conveyancer">Conveyancers</option>
              <option value="inspector">Inspectors</option>
              <option value="photographer">Photographers</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="rejected">Rejected</option>
            </select>
            <button>
              <Users className="h-4 w-4 mr-2" />
              Add New Partner
            </button>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPartners.map((partner) => {
            const TypeIcon = partnerTypeIcons[partner.type]
            
            return (
              <div key={partner.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start">
                    <div className={`rounded-full p-3 mr-4 ${
                      partner.type === 'conveyancer' ? 'bg-blue-100' :
                      partner.type === 'inspector' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <TypeIcon className={`h-6 w-6 ${
                        partner.type === 'conveyancer' ? 'text-blue-600' :
                        partner.type === 'inspector' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{partner.businessName}</h3>
                      <p className="text-sm text-gray-600">ABN: {partner.abn}</p>
                      <span className={`mt-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        partner.status === 'active' ? 'bg-green-100 text-green-800' :
                        partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        partner.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {partner.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Contact:</span>
                    <span className="ml-1">{partner.contactName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Commission:</span>
                    <span className="ml-1 font-medium">{partner.commissionRate}%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Service Areas:</span>
                    <span className="ml-1">{partner.serviceAreas.join(', ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-y">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Jobs</p>
                    <p className="font-semibold">{partner.totalJobs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-semibold">{partner.rating || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-semibold">${partner.revenue}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  {partner.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(partner.id, 'rejected')}
                        className="px-3 py-1 text-sm border border-gray-300 rounded text-red-600 hover:bg-red-50 inline-flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(partner.id, 'active')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingPartner(partner)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Commission
                      </button>
                      {partner.status === 'active' ? (
                        <button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(partner.id, 'paused')}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Pause
                        </button>
                      ) : partner.status === 'paused' ? (
                        <button
                          size="sm"
                          onClick={() => handleStatusChange(partner.id, 'active')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Edit Commission Modal */}
        {editingPartner && (
          <EditCommissionModal
            partner={editingPartner}
            onClose={() => setEditingPartner(null)}
            onSave={handleCommissionChange}
          />
        )}
      </div>
    </div>
  )
}