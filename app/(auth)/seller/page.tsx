'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, MapPin, List, Map, ListPlus } from 'lucide-react'
import BuySelHeader from '@/components/BuySelHeader'
import AddPropertyDialog from '@/components/AddPropertyDialog'
import PropertyCard from '@/components/PropertyCard'
import { useAuth } from '@/hooks/useAuth'
import toast, { Toaster } from 'react-hot-toast'
import { Property } from '@/types/property'
import type { GoogleMap, LatLngBounds, GoogleMarker, GoogleInfoWindow } from '@/types/google-maps'

export default function SellerPage() {
  const [componentError, setComponentError] = useState<Error | null>(null)

  if (componentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Component Error</h2>
          <p className="text-red-600 mb-4">{componentError.message}</p>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {componentError.stack}
          </pre>
        </div>
      </div>
    )
  }

  return <SellerPageContent setComponentError={setComponentError} />
}

function SellerPageContent({ setComponentError }: { setComponentError: (error: Error) => void }) {
  const { user, isAuthenticated } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  const [error, setError] = useState<string | null>(null)
  
  const [newProperty, setNewProperty] = useState<Property|null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<GoogleMap | null>(null)

  useEffect(() => {
    try {
      fetchProperties()
    } catch (err) {
      setComponentError(err as Error)
    }
  }, [])

  const initializeMap = React.useCallback(() => {
    if (!mapRef.current || !window.google?.maps || properties.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    const center = properties[0].lat && properties[0].lon 
      ? { lat: properties[0].lat, lng: properties[0].lon }
      : { lat: -33.8688, lng: 151.2093 }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
    })

    googleMapRef.current = map

    properties.forEach((property) => {
      if (property.lat && property.lon && window.google?.maps) {
        const priceLabel = `$${(property.price / 1000).toFixed(0)}k`
        
        const marker = new window.google.maps.Marker({
          position: { lat: property.lat, lng: property.lon },
          map,
          title: property.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="50" viewBox="0 0 120 50">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                  </filter>
                </defs>
                <g filter="url(#shadow)">
                  <rect x="5" y="5" width="110" height="36" rx="18" fill="white" stroke="#FF6600" stroke-width="2"/>
                  <text x="60" y="28" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#FF6600">${priceLabel}</text>
                </g>
                <polygon points="60,41 55,46 65,46" fill="white" stroke="#FF6600" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(120, 50),
            anchor: new window.google.maps.Point(60, 46),
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">${property.title}</h3>
              <p style="font-size: 14px; margin: 0 0 8px 0; color: #6b7280;">${property.address}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 700; font-size: 18px; color: #FF6600;">$${property.price.toLocaleString()}</span>
              </div>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        bounds.extend({ lat: property.lat, lng: property.lon })
      }
    })

    if (properties.some(p => p.lat && p.lon)) {
      map.fitBounds(bounds)
    }
  }, [properties])

  useEffect(() => {
    if (activeTab === 'map' && !window.google?.maps) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API}`
      script.async = true
      script.defer = true
      script.onload = () => {
        if (properties.length > 0) {
          initializeMap()
        }
      }
      document.head.appendChild(script)
    } else if (activeTab === 'map' && window.google?.maps && properties.length > 0) {
      initializeMap()
    }
  }, [activeTab, properties, initializeMap])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('https://buysel.azurewebsites.net/api/property/seller/1')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching properties:', error)
      setError(`Failed to load properties: ${errorMessage}`)
      toast.error(`Failed to load properties: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = async (property: Property) => {
    try {
      const jsn=JSON.stringify(property)
      //alert(jsn);
      const response = await fetch('https://buysel.azurewebsites.net/api/property', {
        method: (property.id==0)?'POST':'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsn,
      })
      if (response.ok) {
        toast.success('Property saved successfully!')
        setNewProperty(null)
        fetchProperties()
      }
    } catch (error) {
      console.error('Error adding property:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
<Toaster position="top-right" />
<BuySelHeader user={user} isAuthenticated={isAuthenticated} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'list'
                    ? 'bg-[#FF6600] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'map'
                    ? 'bg-[#FF6600] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Map className="w-4 h-4" />
                Map View
              </button>
            </div>

            <button
              onClick={() => setNewProperty(
                {
                  id: 0,
                  title: '',
                  address: '',
                  dte: new Date(),
                  sellerid: 1,
                  price: 0,
                  lat: 0,
                  lon: 0,
                  photobloburl: null,
                  typeofprop: null,
                  suburb: null,
                  postcode: null,
                  beds: null,
                  baths: null,
                  carspaces: null,
                  landsize: null,
                  buildyear: null,
                  state:null,
                  country:null
                })
              }
              className="flex items-center gap-2 bg-[#FF6600] text-white px-4 py-2 rounded-lg hover:bg-[#FF5500] transition-colors"
            >
              <ListPlus className="w-4 h-4" />
              <span>List Property</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error Loading Properties</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : activeTab === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={setNewProperty}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div ref={mapRef} className="h-[600px] w-full rounded" />
            <div className="mt-4 space-y-2">
              {properties.map((property) => (
                <div key={property.id} className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#FF6600]" />
                  <span className="font-medium">{property.title}</span>
                  <span className="text-gray-500">
                    ({property.lat}, {property.lon})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    {newProperty &&  <AddPropertyDialog
        onClose={() => {
          setNewProperty(null)
          fetchProperties()
        }}
        onSave={handleAddProperty}
        property={newProperty}
      />}
    </div>
  )
}
