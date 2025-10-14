'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, MapPin, List, Map } from 'lucide-react'
import BuySelHeader from '@/components/BuySelHeader'
import AddPropertyDialog from '@/components/AddPropertyDialog'
import { useAuth } from '@/hooks/useAuth'
import toast, { Toaster } from 'react-hot-toast'

interface Property {
  id: number
  title: string
  address: string
  dte: Date
  sellerid: number
  price: number
  lat: number
  lon: number
}

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: new (element: HTMLElement, options?: unknown) => GoogleMap
        LatLngBounds: new () => LatLngBounds
        Marker: new (options?: unknown) => GoogleMarker
        InfoWindow: new (options?: unknown) => GoogleInfoWindow
        Size: new (width: number, height: number) => GoogleSize
        Point: new (x: number, y: number) => GooglePoint
        event?: {
          clearInstanceListeners: (instance: unknown) => void
        }
      }
    }
    initMap: () => void
  }
}

interface GoogleMap {
  fitBounds: (bounds: LatLngBounds) => void
}

interface LatLngBounds {
  extend: (point: { lat: number; lng: number }) => void
}

interface GoogleMarker {
  addListener: (event: string, handler: () => void) => void
}

interface GoogleInfoWindow {
  open: (map: GoogleMap, marker: GoogleMarker) => void
}

type GoogleSize = object
type GooglePoint = object

export default function SellerPage() {
  const { user, isAuthenticated } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  
  const [newProperty, setNewProperty] = useState<Property|null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<GoogleMap | null>(null)

  useEffect(() => {
    fetchProperties()
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
        const labelContent = `${property.title}\n${property.address}\n$${property.price.toLocaleString()}`
        
        const marker = new window.google.maps.Marker({
          position: { lat: property.lat, lng: property.lon },
          map,
          title: labelContent,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="240" height="90" viewBox="0 0 240 90">
                <rect x="5" y="5" width="230" height="80" rx="8" fill="#fb923c" stroke="black" stroke-width="2"/>
                <text x="120" y="28" font-size="16" font-weight="bold" text-anchor="middle" fill="black">${property.title}</text>
                <text x="120" y="50" font-size="13" text-anchor="middle" fill="black">${property.address}</text>
                <text x="120" y="72" font-size="15" font-weight="bold" text-anchor="middle" fill="black">$${property.price.toLocaleString()}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(240, 90),
            anchor: new window.google.maps.Point(120, 45),
          },
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; background: #fb923c; color: black; border-radius: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px;">${property.title}</h3>
              <p style="font-size: 13px; margin-bottom: 4px;">${property.address}</p>
              <p style="font-weight: bold; font-size: 15px;">$${property.price.toLocaleString()}</p>
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
      const response = await fetch('https://buysel.azurewebsites.net/api/property/seller/1')
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
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
              })
            }
            className="flex items-center gap-2 bg-[#FF6600] text-white px-4 py-2 rounded-lg hover:bg-[#FF5500] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-[#FF6600] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
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
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Map className="w-4 h-4" />
            Map View
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : activeTab === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <button
                  onClick={() => {
                  
                    
                      setNewProperty(property)
                     
                    
                  }}
                  className="w-full text-left bg-gradient-to-r from-gray-800 to-black text-white px-4 py-2 rounded-lg hover:from-gray-900 hover:to-gray-800 transition-all mb-2"
                >
                  <h3 className="text-xl font-semibold">{property.title}</h3>
                </button>
                <div className="flex items-start gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <p className="text-sm">{property.address}</p>
                </div>
                <div className="text-2xl font-bold text-[#FF6600] mb-2">
                  ${property.price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Listed: {new Date(property.dte).toLocaleDateString()}
                </div>
              </div>
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
        }}
        onSave={handleAddProperty}
        property={newProperty}
      />}
    </div>
  )
}
