import { MapPin, Heart, Bed, Bath, Car, Home, Shield, CheckCircle, Camera } from 'lucide-react'
import { Property } from '@/types/property'
import { getPhotoUrl } from '@/lib/azure-config'

interface PropertyCardProps {
  property: Property
  onClick: (property: Property) => void
}

const badgeIcons = {
  contract: { icon: Shield, label: 'Contract Ready', color: 'text-green-600 bg-green-100' },
  smoke_alarm: { icon: Shield, label: 'Smoke Alarm', color: 'text-green-600 bg-green-100' },
  building_pest: { icon: CheckCircle, label: 'Building & Pest', color: 'text-blue-600 bg-blue-100' },
  pro_photos: { icon: Camera, label: 'Pro Photos', color: 'text-purple-600 bg-purple-100' }
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
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
        <button
          type="button"
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <Heart className="h-5 w-5 text-gray-600" />
        </button>
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
          {(['contract', 'smoke_alarm', 'building_pest', 'pro_photos'] as const).map((badge) => {
            const badgeInfo = badgeIcons[badge]
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
  )
}
