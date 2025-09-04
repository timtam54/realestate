'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronRight, ChevronLeft, Home, DollarSign, Camera, Shield, CreditCard, CheckCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

const propertySchema = z.object({
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'TOWNHOUSE', 'LAND', 'RURAL', 'COMMERCIAL']),
  streetAddress: z.string().min(5, 'Please enter a valid street address'),
  suburb: z.string().min(2, 'Please enter a suburb'),
  postcode: z.string().regex(/^\d{4}$/, 'Please enter a valid 4-digit postcode'),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  carSpaces: z.number().min(0).max(10),
  landSize: z.number().optional(),
  buildYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  askingPrice: z.number().min(10000, 'Price must be at least $10,000'),
  settlementTerms: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

const steps = [
  { id: 1, name: 'Property Details', icon: Home },
  { id: 2, name: 'Price & Terms', icon: DollarSign },
  { id: 3, name: 'Photos & Video', icon: Camera },
  { id: 4, name: 'Compliance & Documents', icon: Shield },
  { id: 5, name: 'Review & Payment', icon: CreditCard },
]

export default function ListPropertyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0)
  const [contractStatus, setContractStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      bedrooms: 3,
      bathrooms: 2,
      carSpaces: 2,
    }
  })

  const onSubmit = async (data: PropertyFormData) => {
    console.log('Form data:', data)
    // Handle form submission
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Home className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold">Real Estate Matchmaker</span>
            </Link>
            <Button variant="outline" asChild>
              <Link href="/seller/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.id <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-0.5 w-12 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Property Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    {...register('propertyType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select property type</option>
                    <option value="HOUSE">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="LAND">Land</option>
                    <option value="RURAL">Rural</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                  {errors.propertyType && (
                    <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    {...register('streetAddress')}
                    type="text"
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.streetAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suburb
                    </label>
                    <input
                      {...register('suburb')}
                      type="text"
                      placeholder="Townsville"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.suburb && (
                      <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      {...register('postcode')}
                      type="text"
                      placeholder="4810"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.postcode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postcode.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      {...register('bedrooms', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="20"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      {...register('bathrooms', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Car Spaces
                    </label>
                    <input
                      {...register('carSpaces', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Land Size (m²) <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      {...register('landSize', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="800"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Build Year <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      {...register('buildYear', { valueAsNumber: true })}
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      placeholder="2010"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" disabled>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Price & Terms */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Price & Terms</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Listing Title
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="Modern Family Home with Pool"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={5}
                    placeholder="Describe your property's key features, recent renovations, neighborhood amenities..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asking Price (AUD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      {...register('askingPrice', { valueAsNumber: true })}
                      type="number"
                      min="10000"
                      placeholder="750000"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.askingPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.askingPrice.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Settlement Terms <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    {...register('settlementTerms')}
                    type="text"
                    placeholder="30/60/90 days"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Photos & Video */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Photos & Video</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Photos
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload up to 20 photos. The first photo will be your hero image.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop photos here, or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setPhotos(files)
                      }}
                    />
                    <Button type="button" variant="outline" size="sm">
                      Select Photos
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Tour Link <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Add a YouTube or Vimeo link for a video tour (max 60 seconds)
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Compliance & Documents */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Compliance & Documents</h2>
              
              <div className="space-y-6">
                {/* Contract of Sale - Mandatory */}
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center">
                        <Shield className="h-5 w-5 text-blue-600 mr-2" />
                        Contract of Sale (Required)
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Must be prepared by a licensed conveyancer before publishing
                      </p>
                    </div>
                    {contractStatus === 'completed' ? (
                      <span className="text-green-600 flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setContractStatus('in_progress')}
                      >
                        Get Contract
                      </Button>
                    )}
                  </div>
                </div>

                {/* Optional Compliance Badges */}
                <div className="space-y-3">
                  <h3 className="font-medium">Optional Compliance Badges</h3>
                  
                  {[
                    { name: 'Smoke Alarm Compliance', price: 150 },
                    { name: 'Pool Safety Certificate', price: 200 },
                    { name: 'Building & Pest Report', price: 450 },
                    { name: 'Title Search', price: 100 },
                    { name: 'Professional Photography', price: 350 },
                  ].map((item) => (
                    <div key={item.name} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Add ${item.price} - Increases buyer trust
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={contractStatus !== 'completed'}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Payment */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Review & Payment</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Listing Fee (Flat Rate)</span>
                      <span className="font-medium">$500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contract of Sale (via Conveyancer)</span>
                      <span className="text-green-600">Included</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>$500.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Details
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Secure payment via Stripe
                  </p>
                  <Button type="button" className="w-full">
                    Proceed to Payment
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    By proceeding, you agree to our Terms of Service and confirm that:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All information provided is accurate and truthful</li>
                    <li>You are the legal owner or authorized agent</li>
                    <li>The property complies with QLD regulations</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="submit">
                  Complete Listing
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}