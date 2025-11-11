'use client'

import { useState, useEffect } from 'react'
import { Activity, Search, Download, User, Globe, Zap, FileText, Calendar, Hash, RefreshCw, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { ApiAuditLog } from '@/types/audit'
import PushNotificationTestPanel from '@/components/PushNotificationTestPanel'


export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<ApiAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://buysel.azurewebsites.net/api/audit/audit')
      if (response.ok) {
        const data: ApiAuditLog[] = await response.json()
        setLogs(data)
      } else {
        console.error('Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (searchQuery && 
        !log.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.page.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-red-600 p-2 rounded-lg mr-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg sm:text-xl">Admin Console</span>
                <span className="text-xs sm:text-sm text-gray-400 block hidden sm:block">Audit Log</span>
              </div>
            </div>
            <Link
              href="/"
              className="px-3 py-2 sm:px-4 text-sm text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="hidden sm:inline">Back to Buyer/Seller</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-1 sm:gap-2 lg:space-x-8 lg:flex-nowrap">
            <Link href="/admin/listings" className="px-3 py-3 text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">
              Listings
            </Link>
            <Link href="/admin/users" className="px-3 py-3 text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">
              Users
            </Link>
            <Link href="/admin/document-requests" className="px-3 py-3 text-sm font-medium hover:bg-gray-700 transition-colors whitespace-nowrap">
              <span className="hidden md:inline">Document Requests</span>
              <span className="md:hidden">Requests</span>
            </Link>
            <Link href="/admin/audit" className="px-3 py-3 text-sm font-medium bg-gray-900 border-b-2 border-red-500 whitespace-nowrap">
              <span className="hidden md:inline">Audit Log</span>
              <span className="md:hidden">Audit</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, action, or page..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchAuditLogs}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Logs</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Audit Logs */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center">
              <Loader2 className="animate-spin h-8 w-8 text-red-600" />
              <span className="ml-3 text-gray-600">Loading audit logs...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-600">Try adjusting your search filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[21%]">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          {log.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-2">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">{log.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          {log.page}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{new Date(log.dte).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{new Date(log.dte).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 text-gray-400 mr-2" />
                          {log.ipaddress || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-green-500 mr-2" />
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {log.action}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="lg:hidden space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    {/* Header with ID and Timestamp */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-semibold text-gray-900">ID: {log.id}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(log.dte).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Full Timestamp */}
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{new Date(log.dte).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          
                          <p className="text-sm font-medium text-gray-900">{log.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* IP Address */}
                    <div className="mb-3">
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-xs text-gray-500 mr-2">IP:</span>
                        <span className="text-gray-900">{log.ipaddress || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mb-3">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-xs text-gray-500 mr-2">Action:</span>
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {log.action}
                        </span>
                      </div>
                    </div>

                    {/* Page */}
                    <div>
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-xs text-gray-500 mr-2">Page:</span>
                        <span className="text-gray-900 font-medium">{log.page}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Push Notification Test Panel */}
      <PushNotificationTestPanel />
    </div>
  )
}