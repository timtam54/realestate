'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Home,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserData } from '@/hooks/useUserData'
import { Property } from '@/types/property'
import { Offer } from '@/types/offer'
import OffersList from '@/components/OffersList'
import MakeOfferDialog from '@/components/MakeOfferDialog'

export default function SellerOffersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { userId, isLoading: userLoading } = useUserData()

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Counter offer state
  const [counterOfferTarget, setCounterOfferTarget] = useState<Offer | null>(null)
  const [showCounterDialog, setShowCounterDialog] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (userId) {
      fetchSellerProperties()
    }
  }, [userId])

  const fetchSellerProperties = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch seller's properties
      const response = await fetch(`https://buysel.azurewebsites.net/api/property`)
      if (!response.ok) throw new Error('Failed to fetch properties')

      const allProperties: Property[] = await response.json()
      // Filter to only this seller's properties
      const sellerProps = allProperties.filter(p => p.sellerid === userId)
      setProperties(sellerProps)

      // Auto-select first property if available
      if (sellerProps.length > 0 && !selectedProperty) {
        setSelectedProperty(sellerProps[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCounterOffer = (offer: Offer) => {
    setCounterOfferTarget(offer)
    setShowCounterDialog(true)
  }

  const handleCounterOfferSubmit = async (counterAmount: number, conditions: string) => {
    if (!counterOfferTarget || !selectedProperty || !userId) return

    try {
      const counterOffer = {
        property_id: selectedProperty.id,
        buyer_id: counterOfferTarget.buyer_id,
        status: 'pending',
        offer_amount: counterAmount,
        deposit_amount: counterOfferTarget.deposit_amount,
        settlement_days: counterOfferTarget.settlement_days,
        finance_days: counterOfferTarget.finance_days,
        inspection_days: counterOfferTarget.inspection_days,
        conditions_json: conditions,
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        parent_offer_id: counterOfferTarget.id,
        version: counterOfferTarget.version + 1
      }

      // First, update the original offer status to 'countered'
      const originalOffer = {
        ...counterOfferTarget,
        status: 'countered',
        updated_at: new Date().toISOString()
      }

      await fetch('https://buysel.azurewebsites.net/api/offer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(originalOffer)
      })

      // Then create the counter offer
      const response = await fetch('https://buysel.azurewebsites.net/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(counterOffer)
      })

      if (!response.ok) throw new Error('Failed to create counter offer')

      // Send push notification to buyer about the counter offer
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: counterOfferTarget.buyer_id,
            payload: {
              title: 'Counter Offer Received!',
              body: `The seller has made a counter offer of $${counterAmount.toLocaleString()} for ${selectedProperty.address}`,
              url: '/buyer/offers',
              propertyId: selectedProperty.id
            }
          })
        })
      } catch (pushError) {
        console.error('Failed to send push notification:', pushError)
      }

      setShowCounterDialog(false)
      setCounterOfferTarget(null)
      // Refresh will happen via OffersList component
    } catch (err) {
      console.error('Counter offer error:', err)
    }
  }

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6600] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/seller')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Offers Received</h1>
              <p className="text-sm text-gray-500">View and manage offers on your properties</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#FF6600] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchSellerProperties}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Listed</h3>
            <p className="text-gray-500 mb-4">
              You need to list a property before you can receive offers.
            </p>
            <button
              onClick={() => router.push('/seller')}
              className="px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500]"
            >
              List a Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Property Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-gray-900 mb-3">Your Properties</h3>
                <div className="space-y-2">
                  {properties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelectedProperty(prop)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedProperty?.id === prop.id
                          ? 'bg-[#FF6600] text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{prop.title || prop.address}</p>
                      <p className={`text-xs truncate ${
                        selectedProperty?.id === prop.id ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        {prop.address}
                      </p>
                      <p className={`text-sm font-bold mt-1 ${
                        selectedProperty?.id === prop.id ? 'text-white' : 'text-[#FF6600]'
                      }`}>
                        ${prop.price?.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Offers List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                {selectedProperty ? (
                  <>
                    {/* Property Summary */}
                    <div className="mb-6 pb-6 border-b">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            {selectedProperty.title || selectedProperty.address}
                          </h2>
                          <p className="text-gray-500">{selectedProperty.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Asking Price</p>
                          <p className="text-xl font-bold text-[#FF6600]">
                            ${selectedProperty.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Offers */}
                    <OffersList
                      propertyId={selectedProperty.id}
                      property={selectedProperty}
                      mode="seller"
                      onCounterOffer={handleCounterOffer}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Select a property to view offers</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Counter Offer Dialog */}
      {showCounterDialog && counterOfferTarget && selectedProperty && (
        <CounterOfferDialog
          isOpen={showCounterDialog}
          onClose={() => {
            setShowCounterDialog(false)
            setCounterOfferTarget(null)
          }}
          originalOffer={counterOfferTarget}
          property={selectedProperty}
          onSubmit={handleCounterOfferSubmit}
        />
      )}
    </div>
  )
}

// Counter Offer Dialog Component
interface CounterOfferDialogProps {
  isOpen: boolean
  onClose: () => void
  originalOffer: Offer
  property: Property
  onSubmit: (amount: number, conditions: string) => void
}

function CounterOfferDialog({
  isOpen,
  onClose,
  originalOffer,
  property,
  onSubmit
}: CounterOfferDialogProps) {
  const [amount, setAmount] = useState<string>(originalOffer.offer_amount.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    if (!num) return ''
    return parseInt(num).toLocaleString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const numAmount = parseFloat(amount.replace(/,/g, ''))
    await onSubmit(numAmount, originalOffer.conditions_json || '{}')

    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Make Counter Offer</h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Original Offer</span>
            <span className="font-medium">${originalOffer.offer_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Asking Price</span>
            <span className="font-medium">${property.price?.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Counter Offer
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatCurrency(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-lg"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Send Counter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
