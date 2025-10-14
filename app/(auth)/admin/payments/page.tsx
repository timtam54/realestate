'use client'

import { useState } from 'react'
import { DollarSign, CreditCard, RefreshCcw, AlertCircle, Download, Search } from 'lucide-react'
import Link from 'next/link'

interface StripeTransaction {
  id: string
  stripePaymentIntentId: string
  amount: number
  currency: string
  status: 'succeeded' | 'processing' | 'failed' | 'refunded' | 'partially_refunded'
  customer: {
    name: string
    email: string
    id: string
  }
  listing: {
    id: string
    title: string
    address: string
  }
  items: {
    type: string
    description: string
    amount: number
  }[]
  refunds: {
    id: string
    amount: number
    reason: string
    createdAt: string
    initiatedBy: string
  }[]
  metadata: {
    listingId: string
    userId: string
  }
  createdAt: string
}

const mockTransactions: StripeTransaction[] = [
  {
    id: 'TXN001',
    stripePaymentIntentId: 'pi_1234567890',
    amount: 500,
    currency: 'AUD',
    status: 'succeeded',
    customer: { name: 'John Smith', email: 'john@email.com', id: 'U123' },
    listing: { id: 'L001', title: 'Modern Family Home', address: '42 Sunset Drive' },
    items: [{ type: 'listing_fee', description: 'Flat listing fee', amount: 500 }],
    refunds: [],
    metadata: { listingId: 'L001', userId: 'U123' },
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'TXN002',
    stripePaymentIntentId: 'pi_2345678901',
    amount: 850,
    currency: 'AUD',
    status: 'partially_refunded',
    customer: { name: 'Sarah Johnson', email: 'sarah@email.com', id: 'U124' },
    listing: { id: 'L002', title: 'Beachfront Apartment', address: '15 Ocean View' },
    items: [
      { type: 'listing_fee', description: 'Flat listing fee', amount: 500 },
      { type: 'pro_photos', description: 'Professional photography', amount: 350 }
    ],
    refunds: [
      { id: 'R001', amount: 350, reason: 'Service not provided', createdAt: '2024-01-21T14:00:00Z', initiatedBy: 'Admin User' }
    ],
    metadata: { listingId: 'L002', userId: 'U124' },
    createdAt: '2024-01-18T09:30:00Z'
  },
  {
    id: 'TXN003',
    stripePaymentIntentId: 'pi_3456789012',
    amount: 950,
    currency: 'AUD',
    status: 'succeeded',
    customer: { name: 'Michael Brown', email: 'michael@email.com', id: 'U125' },
    listing: { id: 'L003', title: 'Rural Property', address: '200 Country Lane' },
    items: [
      { type: 'listing_fee', description: 'Flat listing fee', amount: 500 },
      { type: 'building_pest', description: 'Building & Pest Report', amount: 450 }
    ],
    refunds: [],
    metadata: { listingId: 'L003', userId: 'U125' },
    createdAt: '2024-01-19T11:15:00Z'
  }
]

interface RefundModalProps {
  transaction: StripeTransaction
  onClose: () => void
  onRefund: (transaction: StripeTransaction, amount: number, reason: string) => void
}

function RefundModal({ transaction, onClose, onRefund }: RefundModalProps) {
  const [amount, setAmount] = useState(transaction.amount - transaction.refunds.reduce((sum, r) => sum + r.amount, 0))
  const [reason, setReason] = useState('')
  const maxRefund = transaction.amount - transaction.refunds.reduce((sum, r) => sum + r.amount, 0)

  const handleRefund = () => {
    if (amount > 0 && amount <= maxRefund && reason) {
      onRefund(transaction, amount, reason)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Process Refund</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-medium">{transaction.stripePaymentIntentId}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Original Amount</p>
            <p className="font-medium">${transaction.amount}</p>
          </div>
          
          {transaction.refunds.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Previous Refunds</p>
              <p className="font-medium text-red-600">
                -${transaction.refunds.reduce((sum, r) => sum + r.amount, 0)}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount (max: ${maxRefund})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, maxRefund))}
                max={maxRefund}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter reason for refund..."
              required
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              This refund will be processed immediately and logged in the audit trail.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            onClick={handleRefund}
            disabled={!amount || !reason || amount > maxRefund}
          >
            Process Refund
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  const [showRefundModal, setShowRefundModal] = useState<StripeTransaction | null>(null)

  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus !== 'all' && transaction.status !== filterStatus) return false
    if (searchQuery && 
        !transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.stripePaymentIntentId.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleRefund = (transaction: StripeTransaction, amount: number, reason: string) => {
    const refund = {
      id: `R${Date.now()}`,
      amount,
      reason,
      createdAt: new Date().toISOString(),
      initiatedBy: 'Admin User'
    }
    
    setTransactions(transactions.map(t => {
      if (t.id === transaction.id) {
        const totalRefunded = t.refunds.reduce((sum, r) => sum + r.amount, 0) + amount
        return {
          ...t,
          refunds: [...t.refunds, refund],
          status: totalRefunded >= t.amount ? 'refunded' : 'partially_refunded'
        }
      }
      return t
    }))
    
    // Log audit action
    console.log(`Audit Log: Admin initiated refund of $${amount} for transaction ${transaction.stripePaymentIntentId}. Reason: ${reason}`)
  }

  const stats = {
    total: transactions.reduce((sum, t) => sum + t.amount, 0),
    refunded: transactions.reduce((sum, t) => sum + t.refunds.reduce((s, r) => s + r.amount, 0), 0),
    successful: transactions.filter(t => t.status === 'succeeded').length,
    failed: transactions.filter(t => t.status === 'failed').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">Payment Management</span>
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
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/partners" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Partners
            </Link>
            <Link href="/admin/payments" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
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
        {/* Payment Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Refunded</p>
            <p className="text-2xl font-bold text-red-600">-${stats.refunded}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Successful Payments</p>
            <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Failed Payments</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">Partially Refunded</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <button type="button" className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
                      <p className="text-xs text-gray-500">{transaction.stripePaymentIntentId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.customer.name}</p>
                      <p className="text-sm text-gray-500">{transaction.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.listing.title}</p>
                      <p className="text-sm text-gray-500">{transaction.listing.address}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ${transaction.amount} {transaction.currency}
                      </p>
                      {transaction.refunds.length > 0 && (
                        <p className="text-xs text-red-600">
                          Refunded: ${transaction.refunds.reduce((sum, r) => sum + r.amount, 0)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                      transaction.status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {(transaction.status === 'succeeded' || transaction.status === 'partially_refunded') && (
                        <button
                          type="button"
                          className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => setShowRefundModal(transaction)}
                          disabled={transaction.amount === transaction.refunds.reduce((sum, r) => sum + r.amount, 0)}
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          Refund
                        </button>
                      )}
                      <Link href={`https://dashboard.stripe.com/payments/${transaction.stripePaymentIntentId}`} target="_blank" className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        <CreditCard className="h-4 w-4 mr-1" />
                        View in Stripe
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Refund Modal */}
        {showRefundModal && (
          <RefundModal
            transaction={showRefundModal}
            onClose={() => setShowRefundModal(null)}
            onRefund={handleRefund}
          />
        )}
      </div>
    </div>
  )
}