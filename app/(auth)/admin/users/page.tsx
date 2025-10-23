'use client'

import { useState, useEffect } from 'react'
import { Users, User, Mail, Phone, Search, Filter, Ban, UserCheck, Eye, Shield } from 'lucide-react'
import Link from 'next/link'
import { getAzureBlobUrl } from '@/lib/config'
import type { Seller } from '@/types/seller'
import UserDetailsModal from '@/components/UserDetailsModal'

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  role: 'buyer' | 'seller' | 'conveyancer' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  lastLoginAt: string
  listings?: number
  purchases?: number
  revenue?: number
  messages?: number
  properties?: {
    id: string
    title: string
    status: string
  }[]
}

const mockUsers: UserData[] = [
  {
    id: 'U123',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '0412 345 678',
    role: 'seller',
    status: 'active',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2023-06-15',
    lastLoginAt: '2024-01-21',
    listings: 2,
    revenue: 1000,
    messages: 23,
    properties: [
      { id: 'L001', title: 'Modern Family Home in Edge Hill', status: 'live' },
      { id: 'L004', title: 'Investment Property', status: 'draft' }
    ]
  },
  {
    id: 'U124',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '0423 456 789',
    role: 'seller',
    status: 'active',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2023-08-20',
    lastLoginAt: '2024-01-20',
    listings: 1,
    revenue: 850,
    messages: 12,
    properties: [
      { id: 'L002', title: 'Beachfront Apartment', status: 'live' }
    ]
  },
  {
    id: 'U125',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    role: 'buyer',
    status: 'active',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2023-11-10',
    lastLoginAt: '2024-01-19',
    purchases: 0,
    messages: 8
  },
  {
    id: 'U126',
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '0434 567 890',
    role: 'buyer',
    status: 'suspended',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2023-09-05',
    lastLoginAt: '2024-01-10',
    purchases: 1,
    messages: 45
  },
  {
    id: 'CONV001',
    name: 'Jane Smith',
    email: 'jane@smithconveyancers.com.au',
    phone: '0412 345 678',
    role: 'conveyancer',
    status: 'active',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2023-06-15',
    lastLoginAt: '2024-01-21'
  },
  {
    id: 'U127',
    name: 'Test User',
    email: 'test@example.com',
    role: 'buyer',
    status: 'pending',
    emailVerified: false,
    phoneVerified: false,
    createdAt: '2024-01-21',
    lastLoginAt: '2024-01-21',
    purchases: 0,
    messages: 0
  }
]

interface MockUserDetailsModalProps {
  user: UserData
  onClose: () => void
  onStatusChange: (userId: string, newStatus: UserData['status']) => void
}

function MockUserDetailsModal({ user, onClose, onStatusChange }: MockUserDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-semibold">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.status === 'active' ? 'bg-green-100 text-green-800' :
                user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium flex items-center">
                {user.email}
                {user.emailVerified && <UserCheck className="h-4 w-4 ml-1 text-green-600" />}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium flex items-center">
                {user.phone || 'Not provided'}
                {user.phone && user.phoneVerified && <UserCheck className="h-4 w-4 ml-1 text-green-600" />}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="font-medium">{new Date(user.lastLoginAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Activity Stats */}
          {user.role === 'seller' && (
            <div>
              <h4 className="font-medium mb-3">Seller Activity</h4>
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Listings</p>
                  <p className="text-2xl font-bold">{user.listings || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${user.revenue || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Messages</p>
                  <p className="text-2xl font-bold">{user.messages || 0}</p>
                </div>
              </div>
              
              {user.properties && user.properties.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Properties</h5>
                  <div className="space-y-2">
                    {user.properties.map((property) => (
                      <div key={property.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{property.title}</span>
                        <Link 
                          href={`/admin/listings?id=${property.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {user.role === 'buyer' && (
            <div>
              <h4 className="font-medium mb-3">Buyer Activity</h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Properties Purchased</p>
                  <p className="text-2xl font-bold">{user.purchases || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold">{user.messages || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Actions</h4>
            <div className="flex space-x-3">
              {user.status === 'active' ? (
                <button
                  type="button"
                  onClick={() => onStatusChange(user.id, 'suspended')}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend User
                </button>
              ) : user.status === 'suspended' ? (
                <button
                  type="button"
                  onClick={() => onStatusChange(user.id, 'active')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Reactivate User
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStatusChange(user.id, 'active')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve User
                </button>
              )}
              <button type="button" className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <Link href={`/admin/audit?user=${user.id}`} className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                View Audit Log
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [apiUsers, setApiUsers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedApiUser, setSelectedApiUser] = useState<Seller | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://buysel.azurewebsites.net/api/user')
      if (response.ok) {
        const data: Seller[] = await response.json()
        setApiUsers(data)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (filterRole !== 'all' && user.role !== filterRole) return false
    if (filterStatus !== 'all' && user.status !== filterStatus) return false
    if (searchQuery && 
        !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleStatusChange = (userId: string, newStatus: UserData['status']) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ))
    // Log audit action
    console.log(`Audit Log: Admin changed user ${userId} status to ${newStatus}`)
  }

  const stats = {
    total: users.length,
    buyers: users.filter(u => u.role === 'buyer').length,
    sellers: users.filter(u => u.role === 'seller').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
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
                <span className="text-sm text-gray-400 block">User Management</span>
              </div>
            </div>
            <Link href="/admin/dashboard" className="px-4 py-2 text-white border border-white rounded hover:bg-gray-800">
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
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
              Users
            </Link>
            <Link href="/admin/audit" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Audit Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Buyers</p>
            <p className="text-2xl font-bold">{stats.buyers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Sellers</p>
            <p className="text-2xl font-bold">{stats.sellers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Suspended</p>
            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="conveyancer">Conveyancers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <button type="button" className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading users...</span>
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
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {user.photoazurebloburl && user.photoazurebloburl.trim() !== '' ? (
                        <img
                          src={getAzureBlobUrl(user.photoazurebloburl)}
                          alt={`${user.firstname} ${user.lastname}`}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.firstname} {user.middlename || ''} {user.lastname}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.mobile && (
                          <p className="text-xs text-gray-400">{user.mobile}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{user.address}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.idverified ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.photoverified ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.dte ? new Date(user.dte).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedApiUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* User Details Modal (Mock) */}
        {selectedUser && (
          <MockUserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onStatusChange={(userId, newStatus) => {
              handleStatusChange(userId, newStatus)
              setSelectedUser(null)
            }}
          />
        )}

        {/* API User Details Modal */}
        {selectedApiUser && (
          <UserDetailsModal
            selectedSeller={selectedApiUser}
            setSelectedSeller={setSelectedApiUser}
            setUsers={setApiUsers}
            users={apiUsers}
          />
        )}
      </div>
    </div>
  )
}