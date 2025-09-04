'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Bed, Bath, Car, Home, Shield, CheckCircle, Camera, Heart, Share2, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

// Mock property data
const propertyData = {
  id: '1',
  title: 'Modern Family Home in Edge Hill',
  address: '42 Sunset Drive, Edge Hill QLD 4870',
  suburb: 'Edge Hill',
  price: 750000,
  beds: 4,
  baths: 2,
  cars: 2,
  landSize: 800,
  propertyType: 'House',
  buildYear: 2015,
  description: `This stunning modern family home offers the perfect blend of style, comfort, and convenience. Located in the highly sought-after suburb of Edge Hill, this property features spacious living areas, a contemporary kitchen with premium appliances, and a beautiful outdoor entertainment area.

The master bedroom includes a walk-in wardrobe and ensuite, while three additional bedrooms provide ample space for family or guests. The property also boasts a double garage, landscaped gardens, and is within walking distance to local schools, shops, and cafes.

Key features include:
• Open-plan living and dining areas
• Modern kitchen with stone benchtops
• Covered outdoor entertainment area
• Fully fenced yard with landscaped gardens
• Air conditioning throughout
• Solar panels for energy efficiency
• Walking distance to Edge Hill State School`,
  images: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
  ],
  badges: [
    { type: 'contract', status: 'verified', issuer: 'Smith & Co Conveyancers', date: '2024-01-15' },
    { type: 'smoke_alarm', status: 'verified', issuer: 'SafeHome Inspections', date: '2024-01-10' },
    { type: 'building_pest', status: 'verified', issuer: 'North QLD Inspections', date: '2024-01-08' },
    { type: 'pro_photos', status: 'verified', issuer: 'Townsville Real Estate Photography', date: '2024-01-05' },
  ],
  seller: {
    name: 'John Smith',
    memberSince: '2023-06',
    responseTime: 'Usually responds within 2 hours',
  },
  settlementTerms: '30/60/90 days',
  councilRates: '$2,400/year',
  inclusions: ['Dishwasher', 'Air conditioning units', 'Garden shed', 'Solar panels'],
  exclusions: ['Pool equipment', 'Pot plants'],
}

const badgeInfo = {
  contract: { icon: Shield, label: 'Contract Ready', description: 'Legal Contract of Sale prepared' },
  smoke_alarm: { icon: Shield, label: 'Smoke Alarm Compliant', description: 'Meets QLD smoke alarm requirements' },
  building_pest: { icon: CheckCircle, label: 'Building & Pest Inspected', description: 'Professional inspection completed' },
  pro_photos: { icon: Camera, label: 'Professional Photography', description: 'High-quality images by professional' },
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length)
  }

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
              <Button variant="outline" asChild>
                <Link href="/buyer/search">Back to Search</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="relative h-96 bg-black">
        <img
          src={propertyData.images[currentImageIndex]}
          alt={`Property image ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
        />
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {propertyData.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {propertyData.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 ${
                  index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{propertyData.title}</h1>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    {propertyData.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">${propertyData.price.toLocaleString()}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 border rounded-lg hover:bg-gray-50"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                    <button className="p-2 border rounded-lg hover:bg-gray-50">
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
                <div className="text-center">
                  <Bed className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <p className="font-semibold">{propertyData.beds}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
                <div className="text-center">
                  <Bath className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <p className="font-semibold">{propertyData.baths}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <p className="font-semibold">{propertyData.cars}</p>
                  <p className="text-sm text-gray-600">Car Spaces</p>
                </div>
                <div className="text-center">
                  <Home className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <p className="font-semibold">{propertyData.landSize}m²</p>
                  <p className="text-sm text-gray-600">Land Size</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-3">Property Description</h2>
                <div className="text-gray-700 whitespace-pre-line">{propertyData.description}</div>
              </div>
            </div>

            {/* Compliance Badges */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Compliance & Verification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {propertyData.badges.map((badge) => {
                  const info = badgeInfo[badge.type as keyof typeof badgeInfo]
                  return (
                    <div key={badge.type} className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-2 mr-3">
                          <info.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center">
                            {info.label}
                            <CheckCircle className="h-4 w-4 ml-1 text-green-600" />
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Verified by {badge.issuer} on {new Date(badge.date).toLocaleDateString()}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold">{propertyData.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Build Year</p>
                  <p className="font-semibold">{propertyData.buildYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Settlement Terms</p>
                  <p className="font-semibold">{propertyData.settlementTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Council Rates</p>
                  <p className="font-semibold">{propertyData.councilRates}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Inclusions</p>
                <ul className="list-disc list-inside text-sm">
                  {propertyData.inclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Exclusions</p>
                <ul className="list-disc list-inside text-sm">
                  {propertyData.exclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
              <div className="mb-4">
                <p className="font-semibold">{propertyData.seller.name}</p>
                <p className="text-sm text-gray-600">Member since {propertyData.seller.memberSince}</p>
                <p className="text-sm text-gray-600">{propertyData.seller.responseTime}</p>
              </div>
              
              {!showContactForm ? (
                <Button 
                  onClick={() => setShowContactForm(true)}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              ) : (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="I'm interested in this property..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </form>
              )}
              
              <Button variant="outline" className="w-full mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}