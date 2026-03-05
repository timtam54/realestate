'use client'

import React, { useState } from 'react'
import { Search, Loader2, ExternalLink, Home, Building, Building2, TreePine, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react'
import BuySelHeader from '@/components/BuySelHeader'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'

interface ComparableProperty {
  id: string
  type: 'House' | 'Apartment' | 'Townhouse' | 'Unit' | 'Land' | 'Unknown'
  address: string
  suburb: string
  bedrooms: number | null
  bathrooms: number | null
  carSpaces: number | null
  landArea: string | null
  buildingArea: string | null
  price: string
  priceNumeric: number | null
  source: string
  url?: string
  soldDate?: string
}

type SortField = 'type' | 'bedrooms' | 'bathrooms' | 'price' | 'address' | 'soldDate'
type SortDirection = 'asc' | 'desc'

export default function ComparablesPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchMode, setSearchMode] = useState<'suburb' | 'url'>('suburb')
  const [suburb, setSuburb] = useState('')
  const [postcode, setPostcode] = useState('')
  const [url, setUrl] = useState('')
  const [properties, setProperties] = useState<ComparableProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('price')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterType, setFilterType] = useState<string>('all')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProperties([])

    try {
      const body = searchMode === 'url'
        ? { url }
        : { suburb, postcode }

      const response = await fetch('/api/comparables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comparables')
      }

      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties)
      } else {
        setError('No comparable properties found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Web scraping error: No comparable properties found')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getTypeIcon = (type: ComparableProperty['type']) => {
    switch (type) {
      case 'House':
        return <Home className="w-4 h-4" />
      case 'Apartment':
      case 'Unit':
        return <Building className="w-4 h-4" />
      case 'Townhouse':
        return <Building2 className="w-4 h-4" />
      case 'Land':
        return <TreePine className="w-4 h-4" />
      default:
        return <HelpCircle className="w-4 h-4" />
    }
  }

  const sortedAndFilteredProperties = React.useMemo(() => {
    let filtered = properties

    if (filterType !== 'all') {
      filtered = properties.filter(p => p.type === filterType)
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'bedrooms':
          comparison = (a.bedrooms ?? 0) - (b.bedrooms ?? 0)
          break
        case 'bathrooms':
          comparison = (a.bathrooms ?? 0) - (b.bathrooms ?? 0)
          break
        case 'price':
          comparison = (a.priceNumeric ?? 0) - (b.priceNumeric ?? 0)
          break
        case 'address':
          comparison = a.address.localeCompare(b.address)
          break
        case 'soldDate':
          comparison = (a.soldDate ?? '').localeCompare(b.soldDate ?? '')
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [properties, sortField, sortDirection, filterType])

  const propertyTypes = React.useMemo(() => {
    const types = new Set(properties.map(p => p.type))
    return Array.from(types)
  }, [properties])

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-[#FF6600]">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <BuySelHeader user={user} isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF6600] to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Comparable Properties
          </h1>
          <p className="text-lg mb-8">
            Find similar properties in your area to help determine the right price
          </p>

          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                searchMode === 'suburb'
                  ? 'bg-[#FF6600] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}>
                <input
                  type="radio"
                  name="searchMode"
                  value="suburb"
                  checked={searchMode === 'suburb'}
                  onChange={() => setSearchMode('suburb')}
                  className="sr-only"
                />
                <Search className="w-4 h-4" />
                <span>By Location</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                searchMode === 'url'
                  ? 'bg-[#FF6600] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}>
                <input
                  type="radio"
                  name="searchMode"
                  value="url"
                  checked={searchMode === 'url'}
                  onChange={() => setSearchMode('url')}
                  className="sr-only"
                />
                <ExternalLink className="w-4 h-4" />
                <span>By URL</span>
              </label>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-4">
              {searchMode === 'suburb' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      placeholder="Suburb"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      placeholder="Postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading || (!suburb && !postcode)}
                      className="w-full bg-[#FF6600] text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <input
                      type="url"
                      placeholder="Paste property listing URL to scrape..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading || !url}
                      className="w-full bg-[#FF6600] text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Scrape
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#FF6600]" />
              <p className="text-gray-600 mt-4">Searching for comparable properties...</p>
            </div>
          )}

          {!loading && properties.length > 0 && (
            <>
              {/* Filter Controls */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Filter by type:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    <option value="all">All Types</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <p className="text-gray-600">
                  Showing {sortedAndFilteredProperties.length} of {properties.length} properties
                </p>
              </div>

              {/* Results Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <SortHeader field="type">Type</SortHeader>
                        <SortHeader field="address">Address</SortHeader>
                        <SortHeader field="bedrooms">Beds</SortHeader>
                        <SortHeader field="bathrooms">Baths</SortHeader>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cars
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Land Area
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Building Area
                        </th>
                        <SortHeader field="price">Price</SortHeader>
                        <SortHeader field="soldDate">Sold Date</SortHeader>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedAndFilteredProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{getTypeIcon(property.type)}</span>
                              <span className="text-sm font-medium text-gray-900">{property.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{property.address}</div>
                            {property.suburb && (
                              <div className="text-xs text-gray-500">{property.suburb}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.bedrooms ?? '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.bathrooms ?? '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.carSpaces ?? '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.landArea ?? '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.buildingArea ?? '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-[#FF6600]">
                              {property.price}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.soldDate ?? '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {property.url ? (
                              <a
                                href={property.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                {property.source}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">{property.source}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statistics Summary */}
              {sortedAndFilteredProperties.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Lowest Price</p>
                    <p className="text-xl font-bold text-[#FF6600]">
                      {sortedAndFilteredProperties
                        .filter(p => p.priceNumeric)
                        .sort((a, b) => (a.priceNumeric ?? 0) - (b.priceNumeric ?? 0))[0]?.price || '-'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Highest Price</p>
                    <p className="text-xl font-bold text-[#FF6600]">
                      {sortedAndFilteredProperties
                        .filter(p => p.priceNumeric)
                        .sort((a, b) => (b.priceNumeric ?? 0) - (a.priceNumeric ?? 0))[0]?.price || '-'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Average Price</p>
                    <p className="text-xl font-bold text-[#FF6600]">
                      {(() => {
                        const prices = sortedAndFilteredProperties
                          .map(p => p.priceNumeric)
                          .filter((p): p is number => p !== null)
                        if (prices.length === 0) return '-'
                        const avg = prices.reduce((a, b) => a + b, 0) / prices.length
                        return `$${avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      })()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Median Bedrooms</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(() => {
                        const beds = sortedAndFilteredProperties
                          .map(p => p.bedrooms)
                          .filter((b): b is number => b !== null)
                          .sort((a, b) => a - b)
                        if (beds.length === 0) return '-'
                        const mid = Math.floor(beds.length / 2)
                        return beds.length % 2 === 0
                          ? ((beds[mid - 1] + beds[mid]) / 2).toFixed(1)
                          : beds[mid]
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Comparable Properties</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter a suburb or postcode to find similar properties, or paste a URL to scrape property listings.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
