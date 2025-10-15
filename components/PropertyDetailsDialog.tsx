'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Bed, Bath, Car, Home, Maximize, Calendar, Building, ChevronLeft, ChevronRight } from 'lucide-react'
import { Property } from '@/types/property'
import { getPhotoUrl } from '@/lib/azure-config'

interface Photo {
  id: number
  propertyid: number
  photobloburl: string
  title: string
  dte: string
  doc: boolean | null
}

interface PropertyDetailsDialogProps {
  property: Property
  onClose: () => void
}

export default function PropertyDetailsDialog({ property, onClose }: PropertyDetailsDialogProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loadingPhotos, setLoadingPhotos] = useState(true)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`https://buysel.azurewebsites.net/api/propertyphoto/${property.id}`)
        if (response.ok) {
          const data = await response.json()
          setPhotos(data.filter((p: Photo) => !p.doc))
        }
      } catch (error) {
        console.error('Error fetching photos:', error)
      } finally {
        setLoadingPhotos(false)
      }
    }

    if (property.id > 0) {
      fetchPhotos()
    }
  }, [property.id])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8">
        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Photos Section - Full Width at Top */}
        <div className="relative">
          {loadingPhotos ? (
            <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <p className="text-gray-600">Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex flex-col items-center justify-center">
              <MapPin className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No photos available</p>
            </div>
          ) : (
            <div>
              {/* Main Photo */}
              <div className="relative">
                <img
                  src={getPhotoUrl(photos[currentPhotoIndex].photobloburl) || ''}
                  alt={photos[currentPhotoIndex].title}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
                
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhotoIndex((currentPhotoIndex - 1 + photos.length) % photos.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % photos.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                  <p className="text-sm font-medium">
                    {currentPhotoIndex + 1} / {photos.length}
                  </p>
                </div>
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 1 && (
                <div className="bg-gray-900 px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          index === currentPhotoIndex
                            ? 'border-[#FF6600] ring-2 ring-[#FF6600]'
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={getPhotoUrl(photo.photobloburl) || ''}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Property Details Section - Below Photos */}
        <div className="p-6">
          {/* Title and Price */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h2>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <p className="text-lg text-gray-600">{property.address}</p>
            </div>
            <p className="text-4xl font-bold text-[#FF6600]">
              ${property.price.toLocaleString()}
            </p>
          </div>

          {/* Key Features - Icon Grid */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Property Features</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.beds !== null && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-orange-100 rounded-full p-3">
                    <Bed className="w-6 h-6 text-[#FF6600]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                </div>
              )}

              {property.baths !== null && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Bath className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                </div>
              )}

              {property.carspaces !== null && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-green-100 rounded-full p-3">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.carspaces}</p>
                    <p className="text-sm text-gray-600">Car Spaces</p>
                  </div>
                </div>
              )}

              {property.landsize !== null && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-sm">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Maximize className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.landsize}</p>
                    <p className="text-sm text-gray-600">sqm</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {property.typeofprop && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <Home className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold text-gray-900">{property.typeofprop}</p>
                </div>
              </div>
            )}

            {property.buildyear !== null && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <Calendar className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <p className="text-sm text-gray-600">Year Built</p>
                  <p className="font-semibold text-gray-900">{property.buildyear}</p>
                </div>
              </div>
            )}

            {property.suburb && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <Building className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <p className="text-sm text-gray-600">Suburb</p>
                  <p className="font-semibold text-gray-900">{property.suburb}</p>
                </div>
              </div>
            )}

            {property.postcode && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <MapPin className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <p className="text-sm text-gray-600">Postcode</p>
                  <p className="font-semibold text-gray-900">{property.postcode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
