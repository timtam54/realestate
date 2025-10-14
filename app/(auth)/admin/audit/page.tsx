'use client'

import { useState } from 'react'
import { Activity, User, Home, DollarSign, Shield, FileText, Search, Download, Eye } from 'lucide-react'
import Link from 'next/link'

interface AuditLog {
  id: string
  timestamp: string
  actor: {
    id: string
    name: string
    email: string
    role: string
    ipAddress: string
  }
  action: string
  objectType: 'user' | 'listing' | 'payment' | 'partner' | 'system'
  objectId: string
  objectName: string
  details: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    reason?: string
    metadata?: Record<string, unknown>
  }
  severity: 'info' | 'warning' | 'critical'
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG001',
    timestamp: '2024-01-21T14:30:00Z',
    actor: {
      id: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@realestate.com',
      role: 'admin',
      ipAddress: '203.45.67.89'
    },
    action: 'unlist_property',
    objectType: 'listing',
    objectId: 'L001',
    objectName: 'Modern Family Home in Edge Hill',
    details: {
      before: { status: 'live' },
      after: { status: 'archived' },
      reason: 'Seller request - duplicate listing'
    },
    severity: 'warning'
  },
  {
    id: 'LOG002',
    timestamp: '2024-01-21T13:45:00Z',
    actor: {
      id: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@realestate.com',
      role: 'admin',
      ipAddress: '203.45.67.89'
    },
    action: 'process_refund',
    objectType: 'payment',
    objectId: 'TXN002',
    objectName: 'Payment pi_2345678901',
    details: {
      before: { amount: 850, status: 'succeeded' },
      after: { amount: 850, status: 'partially_refunded', refundAmount: 350 },
      reason: 'Service not provided - photography cancelled'
    },
    severity: 'critical'
  },
  {
    id: 'LOG003',
    timestamp: '2024-01-21T11:20:00Z',
    actor: {
      id: 'U123',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'seller',
      ipAddress: '124.168.45.123'
    },
    action: 'create_listing',
    objectType: 'listing',
    objectId: 'L004',
    objectName: 'Coastal Apartment in North Ward',
    details: {
      after: {
        price: 520000,
        bedrooms: 2,
        bathrooms: 1,
        status: 'draft'
      }
    },
    severity: 'info'
  },
  {
    id: 'LOG004',
    timestamp: '2024-01-21T10:15:00Z',
    actor: {
      id: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@realestate.com',
      role: 'admin',
      ipAddress: '203.45.67.89'
    },
    action: 'approve_partner',
    objectType: 'partner',
    objectId: 'P003',
    objectName: 'Coastal Real Estate Photography',
    details: {
      before: { status: 'pending' },
      after: { status: 'active', commissionRate: 25 }
    },
    severity: 'info'
  },
  {
    id: 'LOG005',
    timestamp: '2024-01-21T09:30:00Z',
    actor: {
      id: 'CONV001',
      name: 'Jane Smith',
      email: 'jane@smithconveyancers.com.au',
      role: 'conveyancer',
      ipAddress: '115.64.89.234'
    },
    action: 'verify_contract',
    objectType: 'listing',
    objectId: 'L003',
    objectName: 'Rural Property with Acreage',
    details: {
      before: { contractStatus: 'pending' },
      after: { contractStatus: 'verified' }
    },
    severity: 'info'
  },
  {
    id: 'LOG006',
    timestamp: '2024-01-20T16:45:00Z',
    actor: {
      id: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@realestate.com',
      role: 'admin',
      ipAddress: '203.45.67.89'
    },
    action: 'update_commission_rate',
    objectType: 'partner',
    objectId: 'P001',
    objectName: 'Smith & Co Conveyancers',
    details: {
      before: { commissionRate: 15 },
      after: { commissionRate: 20 },
      reason: 'Performance bonus adjustment'
    },
    severity: 'warning'
  }
]

const actionIcons = {
  user: User,
  listing: Home,
  payment: DollarSign,
  partner: Shield,
  system: FileText
}

export default function AdminAuditLogPage() {
  const [logs] = useState(mockAuditLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.objectType !== filterType) return false
    if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false
    if (searchQuery && 
        !log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.actor.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.objectName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.action.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getActionDescription = (log: AuditLog) => {
    const actions: Record<string, string> = {
      'create_listing': 'Created listing',
      'update_listing': 'Updated listing',
      'unlist_property': 'Unlisted property',
      'process_refund': 'Processed refund',
      'approve_partner': 'Approved partner',
      'reject_partner': 'Rejected partner',
      'verify_contract': 'Verified contract',
      'update_commission_rate': 'Updated commission rate',
      'login': 'Logged in',
      'logout': 'Logged out'
    }
    return actions[log.action] || log.action
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">Audit Log</span>
              </div>
            </div>
            <button variant="outline" className="text-white border-white hover:bg-gray-800" asChild>
              <Link href="/admin/dashboard">Back to Overview</Link>
            </button>
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
            <Link href="/admin/partners" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Partners
            </Link>
            <Link href="/admin/payments" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Payments
            </Link>
            <Link href="/admin/cms" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              CMS
            </Link>
            <Link href="/admin/audit" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
              Audit Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, action, or object..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="user">User</option>
                <option value="listing">Listing</option>
                <option value="payment">Payment</option>
                <option value="partner">Partner</option>
                <option value="system">System</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="hour">Last Hour</option>
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Object
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const TypeIcon = actionIcons[log.objectType]
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">ID: {log.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.actor.name}</p>
                        <p className="text-sm text-gray-500">{log.actor.email}</p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {log.actor.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {getActionDescription(log)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <TypeIcon className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.objectName}</p>
                          <p className="text-xs text-gray-500">{log.objectType} #{log.objectId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                        log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.actor.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Audit Log Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Log ID</p>
                    <p className="font-medium">{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Timestamp</p>
                    <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Actor</p>
                    <p className="font-medium">{selectedLog.actor.name} ({selectedLog.actor.role})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IP Address</p>
                    <p className="font-medium">{selectedLog.actor.ipAddress}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Action Details</p>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="font-medium mb-2">{getActionDescription(selectedLog)}</p>
                    {selectedLog.details.reason && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {selectedLog.details.reason}
                      </p>
                    )}
                  </div>
                </div>

                {selectedLog.details.before && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before</p>
                    <pre className="bg-gray-50 rounded p-4 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.details.before, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.details.after && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">After</p>
                    <pre className="bg-gray-50 rounded p-4 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.details.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button onClick={() => setSelectedLog(null)}>
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