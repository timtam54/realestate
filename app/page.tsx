'use client'

import { useState } from 'react'
import { Search, Home, Shield, CheckCircle, MapPin, Bed, Bath, Car, Camera } from 'lucide-react'
import Link from 'next/link'
import BuySelHeader from '@/components/BuySelHeader'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
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
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&h=300&fit=crop",
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
      <BuySelHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF6600] to-orange-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sell your house. Keep your price.
          </h1>
          <p className="text-xl mb-8">
            Verified property. No commission. Flat $500 listing fee.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Suburb or postcode"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
              <select
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
              >
                <option value="">Baths</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
              <Link 
                href={`/buyer/search?q=${searchQuery}&beds=${beds}&baths=${baths}`}
                className="bg-[#FF6600] text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Link>
            </form>
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
                <p className="text-sm text-[#333333]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            <Link href="/buyer/search" className="text-[#FF6600] hover:text-orange-700">
              View all properties →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <Link href={`/property/${listing.id}`} key={listing.id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="relative h-48">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.featured && (
                      <span className="absolute top-4 left-4 bg-[#FF6600] text-white px-3 py-1 rounded-full text-sm">
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
                    <div className="flex items-center space-x-4 text-[#333333] text-sm mb-3">
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
                          ✓ {badgeIcons[badge as keyof typeof badgeIcons].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#FF6600]">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">List Your Property</h3>
              <p className="text-gray-600">
                Complete our simple 5-step wizard. Get your Contract of Sale prepared by our licensed conveyancer partners.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#FF6600]">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Verified</h3>
              <p className="text-gray-600">
                Add compliance badges like smoke alarms, pool safety, and building & pest reports to build buyer trust.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#FF6600]">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect with Buyers</h3>
              <p className="text-gray-600">
                Receive messages through our secure platform. Share contact details only when you&apos;re ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#FF6600] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to sell without commission?</h2>
          <p className="text-xl mb-8">
            List your property for a flat $500 fee. No hidden costs, no percentage commissions.
          </p>
          <Link href="/seller/list-property" className="inline-block bg-white text-[#FF6600] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Listing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">BuySel</h3>
              <p className="text-gray-400 text-sm">
                Verified property. No commission. Serving North Queensland.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/seller/how-to-sell" className="hover:text-white">How to Sell</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/faqs" className="hover:text-white">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/buyer/search" className="hover:text-white">Search Properties</Link></li>
                <li><Link href="/buyer/saved-searches" className="hover:text-white">Saved Searches</Link></li>
                <li><Link href="/buyer/guide" className="hover:text-white">Buyer Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 BuySel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
