'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, X, Upload, ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react'
import { BlobServiceClient } from '@azure/storage-blob'
import type { GoogleAutocomplete } from '@/types/google-maps'

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

interface Photo {
  id: number
  propertyid: number
  photobloburl: string
  title: string
  dte: string
}

interface AddPropertyDialogProps {
  onClose: () => void
  onSave: (property: Property) => Promise<void>
  property: Property
}

type WizardStep = 'property-details' | 'price-terms' | 'photos-video' | 'compliance' | 'review'

export default function AddPropertyDialog({  onClose, onSave, property: initialProperty }: AddPropertyDialogProps) {
  const [property, setProperty] = useState<Property>(initialProperty)
  const [currentStep, setCurrentStep] = useState<WizardStep>('property-details')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [photoTitle, setPhotoTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null)

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`https://buysel.azurewebsites.net/api/propertyphoto/${property.id}`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  useEffect(() => {
    if (property.id > 0 && currentStep === 'photos-video') {
      fetchPhotos()
    }
  }, [property.id, currentStep, fetchPhotos])

  useEffect(() => {
    if (currentStep === 'property-details' && addressInputRef.current && !autocompleteRef.current) {
      const loadGoogleMapsScript = () => {
        if (window.google?.maps?.places) {
          initAutocomplete()
          return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          initAutocomplete()
        }
        document.head.appendChild(script)
      }

      const initAutocomplete = () => {
        if (!addressInputRef.current || !window.google?.maps?.places) return

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: ['au'] },
          }
        )

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace()
          if (place?.formatted_address) {
            setProperty({ ...property, address: place.formatted_address })
          }
        })
      }

      loadGoogleMapsScript()
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [currentStep, property])

  const getPhotoUrl = (photobloburl: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
    const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
    const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!
    return `${baseUrl}/${containerName}/${photobloburl}?${sasToken}`
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg')
        setCapturedPhoto(dataUrl)
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    startCamera()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhotoToAzure = async (dataUrl: string): Promise<string> => {
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

      const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
      const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
      const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!

      const blobName = `property-${property.id}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      
      const blockBlobClient = new BlobServiceClient(`${baseUrl}?${sasToken}`)
        .getContainerClient(containerName)
        .getBlockBlobClient(blobName)

      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg'
        }
      })
      
      return blobName
    } catch (error) {
      alert(`Upload error: ${error}`)
      throw error
    }
  }

  const keepPhoto = async () => {
    if (!capturedPhoto || !photoTitle) {
      alert('Please provide a title for the photo')
      return
    }

    setIsUploading(true)
    try {
      const blobUrl = await uploadPhotoToAzure(capturedPhoto)

      await fetch('https://buysel.azurewebsites.net/api/propertyphoto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 0,
          propertyid: property.id,
          photobloburl: blobUrl,
          title: photoTitle,
          dte: new Date(),
        }),
      })

      setCapturedPhoto(null)
      setPhotoTitle('')
      setShowAddPhoto(false)
      await fetchPhotos()
      alert('Photo uploaded successfully!')
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    await onSave(property)
    setProperty(initialProperty)
    setCurrentStep('property-details')
  }

  const handleClose = () => {
    setProperty(initialProperty)
    stopCamera()
    setCapturedPhoto(null)
    setPhotoTitle('')
    setCurrentStep('property-details')
    onClose()
  }

  const handleNext = () => {
    const steps: WizardStep[] = ['property-details', 'price-terms', 'photos-video', 'compliance', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    const steps: WizardStep[] = ['property-details', 'price-terms', 'photos-video', 'compliance', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }



  const steps = [
    { id: 'property-details' as WizardStep, label: 'Property Details', number: 1 },
    { id: 'price-terms' as WizardStep, label: 'Price & Terms', number: 2 },
    { id: 'photos-video' as WizardStep, label: 'Photos & Video', number: 3 },
    { id: 'compliance' as WizardStep, label: 'Compliance & Documents', number: 4 },
    { id: 'review' as WizardStep, label: 'Review & Payment', number: 5 },
  ]

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{property.id === 0 ? 'List New Property' : 'Edit Property'}</h1>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      disabled={property.id === 0 && step.id === 'photos-video'}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        currentStep === step.id
                          ? 'bg-[#FF6600] text-white'
                          : property.id === 0 && step.id === 'photos-video'
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {step.number}
                    </button>
                    <span className={`text-xs mt-2 text-center max-w-[100px] ${
                      currentStep === step.id ? 'text-[#FF6600] font-medium' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2 mb-6" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {currentStep === 'property-details' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Property Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={property.title}
                  onChange={(e) => setProperty({ ...property, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                  placeholder="Enter property title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  ref={addressInputRef}
                  type="text"
                  value={property.address}
                  onChange={(e) => setProperty({ ...property, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                  placeholder="Start typing address..."
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
              >
                Next: Price & Terms
              </button>
            </div>
          </div>
        ) : currentStep === 'price-terms' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Price & Terms</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price</label>
                <input
                  type="number"
                  value={property.price}
                  onChange={(e) => setProperty({ ...property, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                  placeholder="Enter asking price"
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save & Exit
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                >
                  Next: Photos & Video
                </button>
              </div>
            </div>
          </div>
        ) : currentStep === 'compliance' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Compliance & Documents</h2>
            <p className="text-gray-600 mb-4">Add verification badges and compliance documents to build trust with buyers.</p>
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
              >
                Next: Review & Payment
              </button>
            </div>
          </div>
        ) : currentStep === 'review' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Review & Payment</h2>
            <div className="space-y-4 mb-6">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700">Property Details</h3>
                <p className="text-gray-600">{property.title}</p>
                <p className="text-gray-600">{property.address}</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700">Price</h3>
                <p className="text-gray-600">${property.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete & Publish
              </button>
            </div>
          </div>
        ) : showAddPhoto ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => {
                setShowAddPhoto(false)
                setCapturedPhoto(null)
                stopCamera()
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Photos
            </button>
            {!capturedPhoto ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                />
                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FF6600] text-white px-4 py-3 rounded-lg hover:bg-[#FF5500] transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <img src={capturedPhoto} alt="Captured" className="w-full rounded-lg" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo Title</label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                    placeholder="Enter photo title"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={keepPhoto}
                    disabled={isUploading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {isUploading ? 'Uploading...' : 'Keep Photo'}
                  </button>
                  <button
                    onClick={retakePhoto}
                    disabled={isUploading}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Photos & Video</h2>
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No photos yet</p>
                <button
                  onClick={() => {
                    setShowAddPhoto(true)
                    startCamera()
                  }}
                  className="inline-flex items-center gap-2 bg-[#FF6600] text-white px-6 py-3 rounded-lg hover:bg-[#FF5500] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add First Photo
                </button>
              </div>
            ) : (
              <>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={getPhotoUrl(photos[currentPhotoIndex].photobloburl)}
                    alt={photos[currentPhotoIndex].title}
                    className="w-full h-96 object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentPhotoIndex((currentPhotoIndex - 1 + photos.length) % photos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % photos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg">{photos[currentPhotoIndex].title}</h3>
                    <p className="text-white text-sm opacity-90">
                      Photo {currentPhotoIndex + 1} of {photos.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddPhoto(true)
                    startCamera()
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6600] text-white px-4 py-3 rounded-lg hover:bg-[#FF5500] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Photo
                </button>
              </>
            )}
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
              >
                Next: Compliance & Documents
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
