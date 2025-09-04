'use client'

import { useState } from 'react'
import { Search, Home, Shield, DollarSign, CheckCircle, Building2, MapPin, Bed, Bath, Car, Camera } from 'lucide-react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuburb, setSelectedSuburb] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')

  const featuredListings = [
    {
      id: 1,
      title: "Modern Family Home in Edge Hill",
      address: "42 Sunset Drive, Edge Hill",
      price: 750000,
      beds: 4,
      baths: 2,
      cars: 2,
      landSize: 800,
      image: "/api/placeholder/400/300",
      badges: ['contract', 'smoke_alarm', 'building_pest', 'pro_photos'],
      featured: true
    },
    {
      id: 2,
      title: "Beachfront Apartment",
      address: "15 Ocean View, North Ward",
      price: 450000,
      beds: 2,
      baths: 1,
      cars: 1,
      landSize: null,
      image: "/api/placeholder/400/300",
      badges: ['contract', 'smoke_alarm', 'title_search'],
      featured: false
    },
    {
      id: 3,
      title: "Rural Retreat with Acreage",
      address: "200 Country Lane, Charters Towers",
      price: 550000,
      beds: 3,
      baths: 2,
      cars: 3,
      landSize: 4000,
      image: "/api/placeholder/400/300",
      badges: ['contract', 'smoke_alarm', 'pool_safety', 'pro_photos'],
      featured: false
    }
  ]

  const badgeIcons = {
    contract: { icon: Shield, label: 'Contract Ready' },
    smoke_alarm: { icon: Shield, label: 'Smoke Alarm Certified' },
    pool_safety: { icon: Shield, label: 'Pool Safety' },
    building_pest: { icon: CheckCircle, label: 'Building & Pest' },
    title_search: { icon: CheckCircle, label: 'Title Search' },
    pro_photos: { icon: Camera, label: 'Professional Photos' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl">Real Estate Matchmaker</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600">Buy</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Sell</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">How it Works</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>
            </nav>
            <div className="flex space-x-4">
              <button className="text-gray-700 hover:text-blue-600">Sign In</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                List Property
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sell your house. Keep your price.
          </h1>
          <p className="text-xl mb-8">
            Verified property. No commission. Flat $500 listing fee.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Suburb or postcode"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <select
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Beds</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
              <select
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Baths</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Trust what you see</h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Every listing shows verified compliance badges. Look for green ticks to ensure 
            properties meet all legal requirements and have been professionally documented.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(badgeIcons).map(([key, { icon: Icon, label }]) => (
              <div key={key} className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  {listing.featured && (
                    <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      Featured
                    </span>
                  )}
                  <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-lg font-semibold">
                    ${listing.price.toLocaleString()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.address}
                  </p>
                  <div className="flex items-center space-x-4 text-gray-700 text-sm mb-3">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {listing.beds}
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {listing.baths}
                    </span>
                    <span className="flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      {listing.cars}
                    </span>
                    {listing.landSize && (
                      <span className="flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        {listing.landSize}m²
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {listing.badges.slice(0, 4).map((badge) => (
                      <span
                        key={badge}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        ✓ {badgeIcons[badge].label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">List Your Property</h3>
              <p className="text-gray-600">
                Complete our simple 5-step wizard. Get your Contract of Sale prepared by our licensed conveyancer partners.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Verified</h3>
              <p className="text-gray-600">
                Add compliance badges like smoke alarms, pool safety, and building & pest reports to build buyer trust.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect with Buyers</h3>
              <p className="text-gray-600">
                Receive messages through our secure platform. Share contact details only when you're ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to sell without commission?</h2>
          <p className="text-xl mb-8">
            List your property for a flat $500 fee. No hidden costs, no percentage commissions.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Listing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Real Estate Matchmaker</h3>
              <p className="text-gray-400 text-sm">
                Verified property. No commission. Serving North Queensland.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">How to Sell</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Search Properties</a></li>
                <li><a href="#" className="hover:text-white">Saved Searches</a></li>
                <li><a href="#" className="hover:text-white">Buyer Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Real Estate Matchmaker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}