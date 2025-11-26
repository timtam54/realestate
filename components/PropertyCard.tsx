import { useState } from 'react'
import { MapPin, Heart, Bed, Bath, Car, Home, Shield, CheckCircle, MessageCircle, Camera, FileText, Loader2 } from 'lucide-react'
import { Property } from '@/types/property'
import { getPhotoUrl } from '@/lib/azure-config'

interface PropertyCardProps {
  property: Property
  onClick: (property: Property) => void
  onChatClick?: (property: Property) => void
  userId?: number | null
  fav?: boolean
  onFavToggle?: (propertyId: number, fav: boolean) => Promise<void>
}

export default function PropertyCard({ property, onClick, onChatClick, userId, fav = false, onFavToggle }: PropertyCardProps) {
  const [isFavLoading, setIsFavLoading] = useState(false)

  const handleFavClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onFavToggle || isFavLoading) return

    setIsFavLoading(true)
    try {
      await onFavToggle(property.id, !fav)
    } finally {
      setIsFavLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        {property.photobloburl ? (
          <img 
            src={getPhotoUrl(property.photobloburl)!} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          {onChatClick && userId !== property.sellerid && (
            <button
              type="button"
              onClick={() => onChatClick(property)}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              title="Chat with seller"
            >
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </button>
          )}
          {userId && (
            <button
              type="button"
              onClick={handleFavClick}
              disabled={isFavLoading}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isFavLoading ? (
                <Loader2 className="h-5 w-5 text-[#FF6600] animate-spin" />
              ) : (
                <Heart
                  className={`h-5 w-5 ${
                    fav
                      ? 'text-green-500 fill-green-500 animate-pulse'
                      : 'text-gray-600'
                  }`}
                />
              )}
            </button>
          )}
        </div>
        <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-lg font-semibold">
          ${property.price.toLocaleString()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">
          <button
            type="button"
            onClick={() => onClick(property)}
            className="hover:text-blue-600 underline decoration-1 underline-offset-2"
          >
            {property.title}
          </button>
        </h3>
        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {property.address}
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
            {property.carspaces}
          </span>
          <span className="flex items-center">
            <Home className="h-4 w-4 mr-1" />
            {property.landsize }m²
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {/* Contract Ready badge - always shown */}
          <span className="text-xs px-2 py-1 rounded-full flex items-center text-green-600 bg-green-100">
            <Shield className="h-3 w-3 mr-1" />
            Contract Ready
          </span>
          
          {/* Smoke Alarm badge - shown if property listed more than 4 days ago */}
          {(() => {
            const listingDate = new Date(property.dte)
            const fourDaysAgo = new Date()
            fourDaysAgo.setDate(fourDaysAgo.getDate() - 6)
            return listingDate < fourDaysAgo
          })() && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center text-green-600 bg-green-100">
              <Shield className="h-3 w-3 mr-1" />
              Smoke Alarm
            </span>
          )}
          
          {/* Building Inspection badge - shown if report uploaded */}
          {property.buildinginspazureblob && property.buildinginspverified==true && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center text-blue-600 bg-blue-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Building Inspect
            </span>
          )}
          
          {/* Pest Inspection badge - shown if report uploaded */}
          {property.pestinspazureblob && property.pestinspverified==true && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center text-blue-600 bg-blue-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Pest Inspect
            </span>
          )}

          {/* Rates/Title Doc badge - shown if document uploaded and verified */}
          {property.titlesrchcouncilrateazureblob && property.titlesrchcouncilrateverified==true && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center text-orange-600 bg-orange-100">
              <FileText className="h-3 w-3 mr-1" />
              Rates/Title Proof
            </span>
          )}


          {/* Pro Photos badge - shown if property listed more than 7 days ago */}
          {(() => {
            const listingDate = new Date(property.dte)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return listingDate < sevenDaysAgo
          })() && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center text-purple-600 bg-purple-100">
              <Camera className="h-3 w-3 mr-1" />
              Pro Photos
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
