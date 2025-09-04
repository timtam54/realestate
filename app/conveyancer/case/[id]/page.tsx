'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileText, Upload, Download, CheckCircle, AlertCircle, User, Home, Mail, Phone, MapPin, Calendar, ArrowLeft, Save, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

interface CaseDetails {
  id: string
  status: 'new' | 'in_progress' | 'awaiting_seller' | 'completed'
  
  // Property Details
  propertyAddress: string
  suburb: string
  state: string
  postcode: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  carSpaces: number
  landSize: number
  askingPrice: number
  
  // Seller Details
  sellerName: string
  sellerEmail: string
  sellerPhone: string
  sellerAddress: string
  
  // Dates
  assignedDate: string
  dueDate: string
  
  // Additional Info
  settlementTerms: string
  inclusions: string[]
  exclusions: string[]
  specialConditions: string
  
  // Documents
  contractDraft?: {
    url: string
    uploadedAt: string
  }
}

const mockCaseData: CaseDetails = {
  id: 'C001',
  status: 'new',
  
  propertyAddress: '42 Sunset Drive',
  suburb: 'Edge Hill',
  state: 'QLD',
  postcode: '4870',
  propertyType: 'House',
  bedrooms: 4,
  bathrooms: 2,
  carSpaces: 2,
  landSize: 800,
  askingPrice: 750000,
  
  sellerName: 'John Smith',
  sellerEmail: 'john.smith@email.com',
  sellerPhone: '0412 345 678',
  sellerAddress: '42 Sunset Drive, Edge Hill QLD 4870',
  
  assignedDate: '2024-01-20',
  dueDate: '2024-01-22',
  
  settlementTerms: '30/60/90 days',
  inclusions: ['Dishwasher', 'Air conditioning units', 'Garden shed'],
  exclusions: ['Pool equipment', 'Pot plants'],
  specialConditions: 'Subject to building and pest inspection',
}

export default function ConveyancerCaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState(mockCaseData)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleGenerateContract = async () => {
    // In a real app, this would call an API to generate the contract
    setCaseData({ ...caseData, status: 'in_progress' })
    alert('Contract template generated. Please download, complete, and upload the final version.')
  }

  const handleUploadContract = async () => {
    if (!contractFile) return
    
    setIsUploading(true)
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCaseData({
      ...caseData,
      status: 'awaiting_seller',
      contractDraft: {
        url: URL.createObjectURL(contractFile),
        uploadedAt: new Date().toISOString()
      }
    })
    setIsUploading(false)
    setContractFile(null)
  }

  const handleMarkVerified = async () => {
    setCaseData({ ...caseData, status: 'completed' })
    alert('Contract marked as Prepared & Verified. The seller can now proceed with publishing their listing.')
    router.push('/conveyancer/queue')
  }

  const statusConfig = {
    new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'New Case' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: FileText, label: 'In Progress' },
    awaiting_seller: { color: 'bg-orange-100 text-orange-800', icon: User, label: 'Awaiting Seller Review' },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified' }
  }

  const status = statusConfig[caseData.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-2" />
              <div>
                <span className="font-bold text-xl">Real Estate Matchmaker</span>
                <span className="text-sm text-gray-600 block">Conveyancer Portal</span>
              </div>
            </Link>
            <Button variant="outline" asChild>
              <Link href="/conveyancer/queue">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Queue
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Case #{caseData.id} - Contract of Sale Preparation
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full ${status.color}`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {status.label}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {new Date(caseData.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Property Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{caseData.propertyAddress}</p>
                  <p className="text-sm">{caseData.suburb}, {caseData.state} {caseData.postcode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-medium">{caseData.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asking Price</p>
                  <p className="font-medium">${caseData.askingPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Settlement Terms</p>
                  <p className="font-medium">{caseData.settlementTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Configuration</p>
                  <p className="font-medium">{caseData.bedrooms} bed • {caseData.bathrooms} bath • {caseData.carSpaces} car</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Land Size</p>
                  <p className="font-medium">{caseData.landSize}m²</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Inclusions</p>
                <ul className="list-disc list-inside text-sm">
                  {caseData.inclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Exclusions</p>
                <ul className="list-disc list-inside text-sm">
                  {caseData.exclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {caseData.specialConditions && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Special Conditions</p>
                  <p className="text-sm">{caseData.specialConditions}</p>
                </div>
              )}
            </div>

            {/* Contract Generation/Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Contract of Sale
              </h2>

              {caseData.status === 'new' && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Generate a Contract of Sale template based on the property details
                  </p>
                  <Button onClick={handleGenerateContract}>
                    Generate Contract Template
                  </Button>
                </div>
              )}

              {caseData.status === 'in_progress' && (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      Contract template has been generated. Please download, complete with all necessary details, and upload the final version.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Contract Template
                    </Button>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Upload completed Contract of Sale
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="contract-upload"
                      />
                      <label htmlFor="contract-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>Select File</span>
                        </Button>
                      </label>
                      {contractFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: {contractFile.name}
                        </p>
                      )}
                    </div>
                    
                    {contractFile && (
                      <Button 
                        onClick={handleUploadContract}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Contract'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {(caseData.status === 'awaiting_seller' || caseData.status === 'completed') && caseData.contractDraft && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800">
                      Contract has been uploaded and is {caseData.status === 'completed' ? 'verified' : 'pending verification'}.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Contract
                    </Button>
                    
                    {caseData.status === 'awaiting_seller' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes for Seller (Optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any special notes or instructions for the seller..."
                          />
                        </div>
                        
                        <Button 
                          onClick={handleMarkVerified}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Prepared & Verified
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Seller Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{caseData.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {caseData.sellerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {caseData.sellerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium flex items-start">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                    <span>{caseData.sellerAddress}</span>
                  </p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <Mail className="h-4 w-4 mr-2" />
                Contact Seller
              </Button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Case Assigned</p>
                    <p className="text-xs text-gray-500">
                      {new Date(caseData.assignedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {caseData.status !== 'new' && (
                  <div className="flex items-start">
                    <div className="bg-yellow-100 rounded-full p-1 mr-3 mt-0.5">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contract Generated</p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {caseData.contractDraft && (
                  <div className="flex items-start">
                    <div className="bg-orange-100 rounded-full p-1 mr-3 mt-0.5">
                      <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contract Uploaded</p>
                      <p className="text-xs text-gray-500">
                        {new Date(caseData.contractDraft.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {caseData.status === 'completed' && (
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Verified & Complete</p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}