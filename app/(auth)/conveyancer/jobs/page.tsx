'use client'

import { useState } from 'react'
import { FileText, DollarSign, Clock, CheckCircle, AlertCircle, Filter, Search, Download, Upload, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ConveyancerHeader from '@/components/ConveyancerHeader'
import Footer from '@/components/Footer'
import { usePageView } from '@/hooks/useAudit'

interface Job {
  id: string
  propertyAddress: string
  suburb: string
  postcode: string
  requestDate: string
  acceptedDate?: string
  deadline: string
  completedDate?: string
  fee: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'paid'
  priority: 'standard' | 'rush'
  sellerName: string
  propertyType: 'House' | 'Unit' | 'Townhouse' | 'Land'
  hasUnreadMessages?: boolean
}

const mockJobs: Job[] = [
  {
    id: 'JOB-001',
    propertyAddress: '123 George Street',
    suburb: 'Brisbane',
    postcode: '4000',
    requestDate: '2025-11-10',
    deadline: '2025-11-14',
    fee: 650,
    status: 'pending',
    priority: 'standard',
    sellerName: 'John Smith',
    propertyType: 'Unit',
    hasUnreadMessages: true
  },
  {
    id: 'JOB-002',
    propertyAddress: '45 Ann Street',
    suburb: 'Fortitude Valley',
    postcode: '4006',
    requestDate: '2025-11-09',
    deadline: '2025-11-11',
    fee: 950,
    status: 'pending',
    priority: 'rush',
    sellerName: 'Sarah Johnson',
    propertyType: 'House'
  },
  {
    id: 'JOB-003',
    propertyAddress: '78 Main Road',
    suburb: 'Wellington Point',
    postcode: '4160',
    requestDate: '2025-11-08',
    acceptedDate: '2025-11-08',
    deadline: '2025-11-13',
    fee: 700,
    status: 'in_progress',
    priority: 'standard',
    sellerName: 'Michael Brown',
    propertyType: 'House',
    hasUnreadMessages: false
  },
  {
    id: 'JOB-004',
    propertyAddress: '22 Creek Road',
    suburb: 'Capalaba',
    postcode: '4157',
    requestDate: '2025-11-05',
    acceptedDate: '2025-11-05',
    deadline: '2025-11-10',
    completedDate: '2025-11-09',
    fee: 700,
    status: 'completed',
    priority: 'standard',
    sellerName: 'Emma Wilson',
    propertyType: 'Townhouse'
  },
  {
    id: 'JOB-005',
    propertyAddress: '99 Stanley Street',
    suburb: 'South Brisbane',
    postcode: '4101',
    requestDate: '2025-11-03',
    acceptedDate: '2025-11-03',
    deadline: '2025-11-08',
    completedDate: '2025-11-07',
    fee: 800,
    status: 'paid',
    priority: 'rush',
    sellerName: 'David Lee',
    propertyType: 'Unit'
  },
  {
    id: 'JOB-006',
    propertyAddress: '156 Boundary Street',
    suburb: 'West End',
    postcode: '4101',
    requestDate: '2025-11-07',
    acceptedDate: '2025-11-07',
    deadline: '2025-11-12',
    fee: 680,
    status: 'in_progress',
    priority: 'standard',
    sellerName: 'Lisa Chen',
    propertyType: 'Unit'
  }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  paid: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  pending: 'Pending Review',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  paid: 'Paid'
}

export default function ConveyancerJobs() {
  const { user, isAuthenticated } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  usePageView('conveyancer-jobs')

  const filteredJobs = mockJobs.filter((job) => {
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
    const matchesSearch =
      searchQuery === '' ||
      job.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleAcceptJob = (jobId: string) => {
    console.log('Accepting job:', jobId)
    // TODO: Implement job acceptance logic
  }

  const handleUploadDocument = (jobId: string) => {
    console.log('Uploading document for job:', jobId)
    // TODO: Implement document upload
  }

  const jobCounts = {
    all: mockJobs.length,
    pending: mockJobs.filter((j) => j.status === 'pending').length,
    in_progress: mockJobs.filter((j) => j.status === 'in_progress').length,
    completed: mockJobs.filter((j) => j.status === 'completed').length,
    paid: mockJobs.filter((j) => j.status === 'paid').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConveyancerHeader user={user} isAuthenticated={isAuthenticated} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-600">Manage all your conveyancing work in one place</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStatus === 'all'
                ? 'border-[#FF6600] bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{jobCounts.all}</p>
            <p className="text-sm text-gray-600">All Jobs</p>
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStatus === 'pending'
                ? 'border-[#FF6600] bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-yellow-600">{jobCounts.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </button>
          <button
            onClick={() => setSelectedStatus('in_progress')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStatus === 'in_progress'
                ? 'border-[#FF6600] bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-purple-600">{jobCounts.in_progress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStatus === 'completed'
                ? 'border-[#FF6600] bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-green-600">{jobCounts.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </button>
          <button
            onClick={() => setSelectedStatus('paid')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStatus === 'paid'
                ? 'border-[#FF6600] bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-600">{jobCounts.paid}</p>
            <p className="text-sm text-gray-600">Paid</p>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address, suburb, job ID, or seller name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]">
                  <option value="all">All Priorities</option>
                  <option value="standard">Standard</option>
                  <option value="rush">Rush</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]">
                  <option value="all">All Types</option>
                  <option value="house">House</option>
                  <option value="unit">Unit</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]">
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">
                            {job.propertyAddress}
                          </h3>
                          {job.hasUnreadMessages && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">
                          {job.suburb}, QLD {job.postcode}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              statusColors[job.status]
                            }`}
                          >
                            {statusLabels[job.status]}
                          </span>
                          {job.priority === 'rush' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              <AlertCircle className="h-3 w-3" />
                              RUSH
                            </span>
                          )}
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            {job.propertyType}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Job ID:</span> {job.id}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Seller:</span> {job.sellerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Due:</span>{' '}
                            {new Date(job.deadline).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            ${job.fee}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    {job.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptJob(job.id)}
                          className="px-4 py-2 bg-[#FF6600] text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-center"
                        >
                          Accept Job
                        </button>
                        <Link
                          href={`/conveyancer/jobs/${job.id}`}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
                        >
                          View Details
                        </Link>
                      </>
                    )}
                    {job.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleUploadDocument(job.id)}
                          className="px-4 py-2 bg-[#FF6600] text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Contract
                        </button>
                        <Link
                          href={`/conveyancer/jobs/${job.id}`}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Message Seller
                        </button>
                      </>
                    )}
                    {(job.status === 'completed' || job.status === 'paid') && (
                      <>
                        <Link
                          href={`/conveyancer/jobs/${job.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new opportunities'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
