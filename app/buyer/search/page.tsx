'use client'

import { useState } from 'react'
import { Search, MapPin, Bed, Bath, Car, Home, Filter, Heart, Shield, CheckCircle, Camera } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

interface Property {
  id: string
  title: string
  address: string
  suburb: string
  price: number
  beds: number
  baths: number
  cars: number
  landSize?: number
  propertyType: string
  image: string
  badges: string[]
  isFavorite: boolean
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Family Home in Edge Hill',
    address: '42 Sunset Drive',
    suburb: 'Edge Hill',
    price: 750000,
    beds: 4,
    baths: 2,
    cars: 2,
    landSize: 800,
    propertyType: 'House',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
    badges: ['contract', 'smoke_alarm', 'building_pest', 'pro_photos'],
    isFavorite: false
  },
  {
    id: '2',
    title: 'Beachfront Apartment with Ocean Views',
    address: '15 Ocean View',
    suburb: 'North Ward',
    price: 450000,
    beds: 2,
    baths: 1,
    cars: 1,
    propertyType: 'Apartment',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    badges: ['contract', 'smoke_alarm', 'title_search'],
    isFavorite: false
  },
  {
    id: '3',
    title: 'Rural Retreat with Acreage',
    address: '200 Country Lane',
    suburb: 'Charters Towers',
    price: 550000,
    beds: 3,
    baths: 2,
    cars: 3,
    landSize: 4000,
    propertyType: 'Rural',
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=300&fit=crop',
    badges: ['contract', 'smoke_alarm', 'pool_safety', 'pro_photos'],
    isFavorite: false
  },
  {
    id: '4',
    title: 'Contemporary Townhouse',
    address: '88 Urban Street',
    suburb: 'Townsville City',
    price: 425000,
    beds: 3,
    baths: 2,
    cars: 1,
    landSize: 250,
    propertyType: 'Townhouse',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
    badges: ['contract', 'smoke_alarm', 'building_pest'],
    isFavorite: false
  }
]

const badgeIcons = {
  contract: { icon: Shield, label: 'Contract Ready', color: 'text-green-600 bg-green-100' },
  smoke_alarm: { icon: Shield, label: 'Smoke Alarm', color: 'text-green-600 bg-green-100' },
  pool_safety: { icon: Shield, label: 'Pool Safety', color: 'text-green-600 bg-green-100' },
  building_pest: { icon: CheckCircle, label: 'Building & Pest', color: 'text-blue-600 bg-blue-100' },
  title_search: { icon: CheckCircle, label: 'Title Search', color: 'text-blue-600 bg-blue-100' },
  pro_photos: { icon: Camera, label: 'Pro Photos', color: 'text-purple-600 bg-purple-100' }
}

export default function SearchPage() {
  const [properties, setProperties] = useState(mockProperties)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    propertyType: '',
    badges: [] as string[]
  })
  const [showFilters, setShowFilters] = useState(false)

  const toggleFavorite = (id: string) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { ...prop, isFavorite: !prop.isFavorite } : prop
    ))
  }

  const filteredProperties = properties.filter(property => {
    // Apply search query
    if (searchQuery && !property.suburb.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !property.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Apply other filters
    if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false
    if (filters.beds && property.beds < parseInt(filters.beds)) return false
    if (filters.baths && property.baths < parseInt(filters.baths)) return false
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false
    if (filters.badges.length > 0 && !filters.badges.every(badge => property.badges.includes(badge))) return false
    
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl">Real Estate Matchmaker</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/buyer/saved" className="text-gray-700 hover:text-blue-600 flex items-center">
                <Heart className="h-5 w-5 mr-1" />
                Saved
              </Link>
              <Link href="/buyer/messages" className="text-gray-700 hover:text-blue-600">
                Messages
              </Link>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suburb or postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Min Price</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Price</label>
                  <input
                    type="number"
                    placeholder="$1,000,000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Min Beds</label>
                  <select
                    value={filters.beds}
                    onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Min Baths</label>
                  <select
                    value={filters.baths}
                    onChange={(e) => setFilters({ ...filters, baths: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Property Type</label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                    <option value="Rural">Rural</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Badges</label>
                  <div className="mt-1 space-y-1">
                    {['contract', 'building_pest', 'title_search'].map(badge => (
                      <label key={badge} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.badges.includes(badge)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, badges: [...filters.badges, badge] })
                            } else {
                              setFilters({ ...filters, badges: filters.badges.filter(b => b !== badge) })
                            }
                          }}
                          className="mr-2"
                        />
                        {badgeIcons[badge as keyof typeof badgeIcons].label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {filteredProperties.length} Properties Found
          </h1>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <Link href={`/property/${property.id}`}>
                <div className="relative h-48">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(property.id)
                    }}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        property.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-lg font-semibold">
                    ${property.price.toLocaleString()}
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">
                  <Link href={`/property/${property.id}`} className="hover:text-blue-600">
                    {property.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.suburb}
                </p>
                <div className="flex items-center space-x-4 text-gray-700 text-sm mb-3">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.beds}
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.baths}
                  </span>
                  <span className="flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    {property.cars}
                  </span>
                  {property.landSize && (
                    <span className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {property.landSize}m²
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {property.badges.map((badge) => {
                    const badgeInfo = badgeIcons[badge as keyof typeof badgeIcons]
                    return (
                      <span
                        key={badge}
                        className={`text-xs px-2 py-1 rounded-full flex items-center ${badgeInfo.color}`}
                      >
                        <badgeInfo.icon className="h-3 w-3 mr-1" />
                        {badgeInfo.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No properties found matching your criteria.</p>
            <Button className="mt-4" onClick={() => {
              setSearchQuery('')
              setFilters({
                minPrice: '',
                maxPrice: '',
                beds: '',
                baths: '',
                propertyType: '',
                badges: []
              })
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}