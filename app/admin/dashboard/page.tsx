'use client'

import { useState } from 'react'
import { Users, Home, DollarSign, FileText, TrendingUp, Shield, AlertCircle, Activity, UserCheck } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalListings: number
  activeListings: number
  totalUsers: number
  activeConveyancers: number
  totalRevenue: number
  monthlyRevenue: number
  pendingDisputes: number
  completedTransactions: number
}

const mockStats: DashboardStats = {
  totalListings: 234,
  activeListings: 156,
  totalUsers: 1847,
  activeConveyancers: 12,
  totalRevenue: 117000,
  monthlyRevenue: 23400,
  pendingDisputes: 3,
  completedTransactions: 234
}

interface RecentActivity {
  id: string
  type: 'listing' | 'payment' | 'user' | 'dispute'
  description: string
  user: string
  timestamp: string
}

const recentActivities: RecentActivity[] = [
  { id: '1', type: 'listing', description: 'New listing created for 42 Sunset Drive', user: 'John Smith', timestamp: '2 hours ago' },
  { id: '2', type: 'payment', description: 'Payment received $500 - Listing fee', user: 'Sarah Johnson', timestamp: '3 hours ago' },
  { id: '3', type: 'user', description: 'New conveyancer registered', user: 'Legal Pro Services', timestamp: '5 hours ago' },
  { id: '4', type: 'dispute', description: 'Dispute opened - Listing accuracy', user: 'Michael Brown', timestamp: '1 day ago' },
  { id: '5', type: 'listing', description: 'Listing marked as sold', user: 'Emma Wilson', timestamp: '1 day ago' }
]

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('week')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">BuySel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Admin User</span>
              <Button variant="outline" className="text-white border-white hover:bg-gray-800" asChild>
                <Link href="/">Exit Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
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
            <Link href="/admin/audit" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Audit Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalListings}</p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  12% from last month
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.activeListings}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {Math.round((mockStats.activeListings / mockStats.totalListings) * 100)}% of total
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${mockStats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  8% from last month
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Conveyancers</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.activeConveyancers}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <UserCheck className="h-4 w-4 inline mr-1" />
                  All verified
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{mockStats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sellers</span>
                <span className="font-semibold">467</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Buyers</span>
                <span className="font-semibold">1,368</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conveyancers</span>
                <span className="font-semibold">{mockStats.activeConveyancers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Listing Fees</span>
                <span className="font-semibold">${(mockStats.monthlyRevenue * 0.7).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Add-on Services</span>
                <span className="font-semibold">${(mockStats.monthlyRevenue * 0.2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Partner Commissions</span>
                <span className="font-semibold text-red-600">-${(mockStats.monthlyRevenue * 0.1).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Net Revenue</span>
                <span className="font-bold text-green-600">${(mockStats.monthlyRevenue * 0.9).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Disputes</span>
                <span className="font-semibold text-orange-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {mockStats.pendingDisputes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verification Queue</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Support Tickets</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Health</span>
                <span className="font-semibold text-green-600">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className={`rounded-full p-2 mr-3 ${
                      activity.type === 'listing' ? 'bg-blue-100' :
                      activity.type === 'payment' ? 'bg-green-100' :
                      activity.type === 'user' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      {activity.type === 'listing' && <Home className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                      {activity.type === 'user' && <Users className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'dispute' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-600">{activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/audit">View Full Audit Log</Link>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/listings">
                  <Home className="h-4 w-4 mr-2" />
                  Manage Listings
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/partners">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve Partners
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/payments">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Refunds
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/cms">
                  <FileText className="h-4 w-4 mr-2" />
                  Update CMS Content
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}