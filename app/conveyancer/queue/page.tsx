'use client'

import { useState } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, User, Filter, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

interface ContractCase {
  id: string
  propertyAddress: string
  suburb: string
  sellerName: string
  sellerEmail: string
  propertyType: string
  askingPrice: number
  status: 'new' | 'in_progress' | 'awaiting_seller' | 'completed'
  assignedDate: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

const mockCases: ContractCase[] = [
  {
    id: 'C001',
    propertyAddress: '42 Sunset Drive',
    suburb: 'Edge Hill',
    sellerName: 'John Smith',
    sellerEmail: 'john.smith@email.com',
    propertyType: 'House',
    askingPrice: 750000,
    status: 'new',
    assignedDate: '2024-01-20',
    dueDate: '2024-01-22',
    priority: 'high'
  },
  {
    id: 'C002',
    propertyAddress: '88 Harbor View',
    suburb: 'Townsville',
    sellerName: 'Sarah Johnson',
    sellerEmail: 'sarah.j@email.com',
    propertyType: 'Apartment',
    askingPrice: 425000,
    status: 'in_progress',
    assignedDate: '2024-01-19',
    dueDate: '2024-01-21',
    priority: 'medium'
  },
  {
    id: 'C003',
    propertyAddress: '15 Ocean Street',
    suburb: 'North Ward',
    sellerName: 'Michael Brown',
    sellerEmail: 'm.brown@email.com',
    propertyType: 'Townhouse',
    askingPrice: 520000,
    status: 'awaiting_seller',
    assignedDate: '2024-01-18',
    dueDate: '2024-01-20',
    priority: 'low'
  },
  {
    id: 'C004',
    propertyAddress: '200 Country Lane',
    suburb: 'Charters Towers',
    sellerName: 'Emma Wilson',
    sellerEmail: 'emma.w@email.com',
    propertyType: 'Rural',
    askingPrice: 550000,
    status: 'completed',
    assignedDate: '2024-01-15',
    dueDate: '2024-01-17',
    priority: 'medium'
  }
]

const statusConfig = {
  new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'New' },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'In Progress' },
  awaiting_seller: { color: 'bg-orange-100 text-orange-800', icon: User, label: 'Awaiting Seller' },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' }
}

const priorityConfig = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-gray-600'
}

export default function ConveyancerQueuePage() {
  const [cases] = useState(mockCases)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const filteredCases = cases.filter(caseItem => {
    if (filterStatus !== 'all' && caseItem.status !== filterStatus) return false
    if (filterPriority !== 'all' && caseItem.priority !== filterPriority) return false
    return true
  })

  const stats = {
    total: cases.length,
    new: cases.filter(c => c.status === 'new').length,
    inProgress: cases.filter(c => c.status === 'in_progress').length,
    completed: cases.filter(c => c.status === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-2" />
              <div>
                <span className="font-bold text-xl">Real Estate Matchmaker</span>
                <span className="text-sm text-gray-600 block">Conveyancer Portal</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Smith & Co Conveyancers</span>
              <Button variant="outline" asChild>
                <Link href="/">Exit Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contract Queue</h1>
          <p className="text-gray-600 mt-2">Manage Contract of Sale preparations for property listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New Cases</p>
                <p className="text-2xl font-semibold">{stats.new}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_seller">Awaiting Seller</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <Button variant="outline" size="sm" onClick={() => {
              setFilterStatus('all')
              setFilterPriority('all')
            }}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.map((caseItem) => {
                const status = statusConfig[caseItem.status]
                const StatusIcon = status.icon
                
                return (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {caseItem.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {caseItem.propertyAddress}
                        </div>
                        <div className="text-sm text-gray-500">
                          {caseItem.suburb} • {caseItem.propertyType}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          ${caseItem.askingPrice.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {caseItem.sellerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {caseItem.sellerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${priorityConfig[caseItem.priority]}`}>
                        {caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(caseItem.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {caseItem.status === 'completed' ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/conveyancer/case/${caseItem.id}`}>
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" asChild>
                          <Link href={`/conveyancer/case/${caseItem.id}`}>
                            {caseItem.status === 'new' ? 'Start' : 'Continue'}
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cases found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}