import { MapPin } from 'lucide-react'

interface Property {
  id: number
  title: string
  address: string
  dte: Date
  sellerid: number
  price: number
  lat: number
  lon: number
  photobloburl: string | null
}

interface PropertyCardProps {
  property: Property
  onClick: (property: Property) => void
}

const getPhotoUrl = (photobloburl: string | null) => {
  if (!photobloburl) return null
  const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
  const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
  const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!
  return `${baseUrl}/${containerName}/${photobloburl}?${sasToken}`
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all duration-300 cursor-pointer">
      {property.photobloburl ? (
        <img 
          src={getPhotoUrl(property.photobloburl)!} 
          alt={property.title}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <MapPin className="w-20 h-20 text-gray-300" />
        </div>
      )}
      <div className="p-6 space-y-4">
        <button
          type="button"
          onClick={() => onClick(property)}
          className="text-left hover:text-[#FF6600] transition-colors"
        >
          <h3 className="text-2xl font-semibold text-gray-900 underline decoration-2 underline-offset-4 decoration-gray-300 hover:decoration-[#FF6600]">
            {property.title}
          </h3>
        </button>
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
          <p className="text-sm leading-relaxed">{property.address}</p>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="text-3xl font-bold text-[#FF6600] mb-2">
            ${property.price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Listed {new Date(property.dte).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
