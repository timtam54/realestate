'use client'

import React, { useState } from 'react'
import { X, DollarSign, Calendar, FileText, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react'
import { Property } from '@/types/property'
import { CreateOfferRequest, QLD_STANDARD_CONDITIONS, SETTLEMENT_OPTIONS, OfferConditions } from '@/types/offer'

interface MakeOfferDialogProps {
  isOpen: boolean
  onClose: () => void
  property: Property
  buyerId: number
  onOfferSubmitted?: () => void
}

export default function MakeOfferDialog({
  isOpen,
  onClose,
  property,
  buyerId,
  onOfferSubmitted
}: MakeOfferDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [offerAmount, setOfferAmount] = useState<string>(property.price?.toString() || '')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [settlementDays, setSettlementDays] = useState<number>(30)
  const [expiryDays, setExpiryDays] = useState<number>(3)

  // Conditions
  const [conditions, setConditions] = useState<OfferConditions>({
    finance: false,
    financeDays: 14,
    buildingPest: false,
    buildingPestDays: 7,
    saleOfProperty: false,
    saleOfPropertyDays: 30,
    valuation: false,
    valuationDays: 14,
    solicitorReview: false,
    solicitorReviewDays: 5,
  })

  const [otherCondition, setOtherCondition] = useState<string>('')

  if (!isOpen) return null

  const handleConditionToggle = (key: keyof OfferConditions) => {
    setConditions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleConditionDaysChange = (key: string, days: number) => {
    setConditions(prev => ({
      ...prev,
      [`${key}Days`]: days
    }))
  }

  const calculateExpiryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + expiryDays)
    return date.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate
      const amount = parseFloat(offerAmount.replace(/,/g, ''))
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid offer amount')
      }

      const deposit = depositAmount ? parseFloat(depositAmount.replace(/,/g, '')) : null
      if (depositAmount && (isNaN(deposit!) || deposit! < 0)) {
        throw new Error('Please enter a valid deposit amount')
      }

      // Build conditions JSON
      const conditionsData: OfferConditions = {}
      if (conditions.finance) {
        conditionsData.finance = true
        conditionsData.financeDays = conditions.financeDays
      }
      if (conditions.buildingPest) {
        conditionsData.buildingPest = true
        conditionsData.buildingPestDays = conditions.buildingPestDays
      }
      if (conditions.saleOfProperty) {
        conditionsData.saleOfProperty = true
        conditionsData.saleOfPropertyDays = conditions.saleOfPropertyDays
      }
      if (conditions.valuation) {
        conditionsData.valuation = true
        conditionsData.valuationDays = conditions.valuationDays
      }
      if (conditions.solicitorReview) {
        conditionsData.solicitorReview = true
        conditionsData.solicitorReviewDays = conditions.solicitorReviewDays
      }
      if (otherCondition.trim()) {
        conditionsData.other = otherCondition.trim()
      }

      const offerData: CreateOfferRequest = {
        property_id: property.id,
        buyer_id: buyerId,
        status: 'pending',
        offer_amount: amount,
        deposit_amount: deposit || undefined,
        settlement_days: settlementDays,
        finance_days: conditions.finance ? conditions.financeDays : undefined,
        inspection_days: conditions.buildingPest ? conditions.buildingPestDays : undefined,
        conditions_json: JSON.stringify(conditionsData),
        expires_at: calculateExpiryDate(),
        version: 1
      }

      const response = await fetch('https://buysel.azurewebsites.net/api/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to submit offer: ${errorText}`)
      }

      setSuccess(true)
      onOfferSubmitted?.()

      // Close after showing success
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    if (!num) return ''
    return parseInt(num).toLocaleString()
  }

  const askingPrice = property.price || 0
  const offerNum = parseFloat(offerAmount.replace(/,/g, '')) || 0
  const priceDiff = offerNum - askingPrice
  const priceDiffPercent = askingPrice > 0 ? ((priceDiff / askingPrice) * 100).toFixed(1) : '0'

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your offer of ${formatCurrency(offerAmount)} has been sent to the seller.
          </p>
          <p className="text-sm text-gray-500">
            You'll be notified when the seller responds.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Make an Offer</h2>
            <p className="text-sm text-gray-500 mt-1">{property.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Asking Price Reference */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Asking Price</span>
              <span className="text-xl font-bold text-gray-900">
                ${askingPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Offer Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Offer Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={offerAmount}
                onChange={(e) => setOfferAmount(formatCurrency(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-lg"
                placeholder="Enter offer amount"
                required
              />
            </div>
            {offerNum > 0 && (
              <p className={`text-sm mt-2 ${priceDiff >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                {priceDiff >= 0 ? '+' : ''}{priceDiffPercent}% {priceDiff >= 0 ? 'above' : 'below'} asking price
                ({priceDiff >= 0 ? '+' : ''}${priceDiff.toLocaleString()})
              </p>
            )}
          </div>

          {/* Deposit Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount (Optional)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={depositAmount}
                onChange={(e) => setDepositAmount(formatCurrency(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="e.g., 10,000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Typically 5-10% of the purchase price
            </p>
          </div>

          {/* Settlement Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settlement Period
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SETTLEMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSettlementDays(option.value)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    settlementDays === option.value
                      ? 'bg-[#FF6600] text-white border-[#FF6600]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#FF6600]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Conditions (Subject to...)
            </label>
            <div className="space-y-3">
              {QLD_STANDARD_CONDITIONS.map((condition) => (
                <div
                  key={condition.key}
                  className={`border rounded-lg p-4 transition-colors ${
                    conditions[condition.key as keyof OfferConditions]
                      ? 'border-[#FF6600] bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={condition.key}
                      checked={!!conditions[condition.key as keyof OfferConditions]}
                      onChange={() => handleConditionToggle(condition.key as keyof OfferConditions)}
                      className="mt-1 h-4 w-4 text-[#FF6600] border-gray-300 rounded focus:ring-[#FF6600]"
                    />
                    <div className="flex-1">
                      <label htmlFor={condition.key} className="font-medium text-gray-900 cursor-pointer">
                        {condition.label}
                      </label>
                      <p className="text-sm text-gray-500 mt-0.5">{condition.description}</p>

                      {conditions[condition.key as keyof OfferConditions] && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-sm text-gray-600">Days to satisfy:</span>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={conditions[`${condition.key}Days` as keyof OfferConditions] || condition.defaultDays}
                            onChange={(e) => handleConditionDaysChange(condition.key, parseInt(e.target.value) || condition.defaultDays)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                          />
                          <span className="text-sm text-gray-500">days</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Other Condition */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="font-medium text-gray-900">Other Conditions</label>
                <textarea
                  value={otherCondition}
                  onChange={(e) => setOtherCondition(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                  rows={2}
                  placeholder="Enter any additional conditions..."
                />
              </div>
            </div>
          </div>

          {/* Offer Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Valid For
            </label>
            <div className="flex items-center gap-3">
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
              </select>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Expires: {new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>The seller will be notified of your offer</li>
                <li>They can accept, reject, or make a counter-offer</li>
                <li>You'll receive a notification when they respond</li>
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !offerAmount}
              className="flex-1 px-6 py-3 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Submit Offer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
