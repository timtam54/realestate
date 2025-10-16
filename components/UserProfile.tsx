'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2, User, FileText, Scale, Camera, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Upload, Calendar, Home, Phone, Mail, Globe, Heart, Users, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import type { GoogleAutocomplete } from '@/types/google-maps'
import { loadGoogleMapsScript } from '@/utils/googleMapsLoader'
import { BlobServiceClient } from '@azure/storage-blob'

interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  middlename?: string
  dateofbirth?: Date|null
  mobile: string
  address: string
  residencystatus: 'citizen' | 'permanent' | 'temporary' | 'foreign' | ''
  /*tfn?: string
  abn?: string
  foreignresident: boolean
  over18: boolean*/
  maritalstatus: 'single' | 'married' | 'divorced' | 'widowed' | 'defacto' |null
  powerofattorney?: string
  /*bsb?: string
  accountnumber?: string
  accountname?: string*/
  idtype: 'passport' | 'driver' | 'none'
  idbloburl: string
  idverified: Date|null
  termsconditions:boolean|null
  privacypolicy:boolean|null
  dte: Date
  ratesnotice:string|null
  titlesearch:string|null
  ratesnoticeverified:Date|null
  titlesearchverified:Date|null
}

interface UserProfileProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

const tabs = [
  { id: 'personal', label: 'Personal Details', icon: User },
  // { id: 'tax', label: 'Tax Information', icon: FileText },
  { id: 'legal', label: 'Legal Capacity', icon: Scale },
  // { id: 'banking', label: 'Banking Details', icon: CreditCard },
  { id: 'identity', label: 'ID Verification', icon: Shield }
]

export default function UserProfile({ email, isOpen, onClose }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('personal')
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set())
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [ratesNoticePreview, setRatesNoticePreview] = useState<string | null>(null)
  const [titleSearchPreview, setTitleSearchPreview] = useState<string | null>(null)
  
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ratesNoticeInputRef = useRef<HTMLInputElement>(null)
  const titleSearchInputRef = useRef<HTMLInputElement>(null)

  const formatDateForInput = (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }

  const fetchUser = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`https://buysel.azurewebsites.net/api/user/email/${email}`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setUser(data)
          updateCompletedTabs(data)
          if (data.idbloburl) {
            const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
            const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
            const container = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!
            setIdPreview(`${baseUrl}/${container}/${data.idbloburl}?${sasToken}`)
          }
          if (data.ratesnotice) {
            const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
            const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
            const container = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!
            setRatesNoticePreview(`${baseUrl}/${container}/${data.ratesnotice}?${sasToken}`)
          }
          if (data.titlesearch) {
            const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
            const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
            const container = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!
            setTitleSearchPreview(`${baseUrl}/${container}/${data.titlesearch}?${sasToken}`)
          }
        } else {
          setUser(createEmptyUser())
        }
      } else {
        setUser(createEmptyUser())
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(createEmptyUser())
      setError('Failed to load user profile - showing empty form')
    } finally {
      setLoading(false)
    }
  }, [email])

  const createEmptyUser = (): User => ({
    id: 0,
    email,
    firstname: '',
    lastname: '',
    middlename: '',
    dateofbirth: null,
    mobile: '',
    address: '',
    residencystatus: '',
    // tfn: '',
    // abn: '',
    // foreignresident: false,
    // over18: false,
    maritalstatus: null,
    powerofattorney: '',
    // bsb: '',
    // accountnumber: '',
    // accountname: '',
    termsconditions: false,
    privacypolicy: false,
    idtype: 'none',
    idbloburl: '',
    idverified: null,
    ratesnotice: null,
    titlesearch: null,
    ratesnoticeverified: null,
    titlesearchverified: null,
    dte: new Date(),
  })

  const updateCompletedTabs = (userData: User) => {
    const completed = new Set<string>()
    
    // Personal Details
    if (userData.firstname && userData.lastname && userData.dateofbirth && 
        userData.mobile && userData.address && userData.residencystatus) {
      completed.add('personal')
    }
    
    // Tax Information
    // if ((userData.tfn || userData.abn) && userData.foreignresident !== undefined) {
    //   completed.add('tax')
    // }
    
    // Legal Capacity
    if (/*userData.over18 &&*/ userData.maritalstatus) {
      completed.add('legal')
    }
    
    // Banking Details
    // if (userData.bsb && userData.accountnumber && userData.accountname) {
    //   completed.add('banking')
    // }
    
    // ID Verification - all three documents required
    if (userData.idtype !== 'none' && userData.idbloburl && userData.ratesnotice && userData.titlesearch) {
      completed.add('identity')
    }
    
    setCompletedTabs(completed)
  }

  useEffect(() => {
    if (isOpen && email) {
      fetchUser()
    }
  }, [isOpen, email, fetchUser])

  useEffect(() => {
    if (isOpen && addressInputRef.current && !autocompleteRef.current && activeTab === 'personal') {
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
          if (place?.formatted_address && user) {
            setUser({ ...user, address: place.formatted_address })
          }
        })
      }

      loadGoogleMapsScript().then(() => {
        initAutocomplete()
      })
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isOpen, user, activeTab])

  const uploadDocumentToAzure = async (file: File, docType: 'id' | 'rates' | 'title'): Promise<string> => {
    try {
      setUploading(true)
      const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE!
      const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN!
      const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER!

      const blobName = `${docType}-${email.replace('@', '-')}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      
      const blockBlobClient = new BlobServiceClient(`${baseUrl}?${sasToken}`)
        .getContainerClient(containerName)
        .getBlockBlobClient(blobName)

      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: {
          blobContentType: file.type
        }
      })
      
      return blobName
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'id' | 'rates' | 'title') => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    
    if (!isImage && !isPDF) {
      toast.error('Please select an image or PDF file')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (docType === 'id') {
          setIdPreview(result)
        } else if (docType === 'rates') {
          setRatesNoticePreview(result)
        } else if (docType === 'title') {
          setTitleSearchPreview(result)
        }
      }
      reader.readAsDataURL(file)

      const blobUrl = await uploadDocumentToAzure(file, docType)
      
      if (docType === 'id') {
        setUser({ ...user, idbloburl: blobUrl })
        toast.success('ID uploaded successfully')
      } else if (docType === 'rates') {
        setUser({ ...user, ratesnotice: blobUrl })
        toast.success('Rates notice uploaded successfully')
      } else if (docType === 'title') {
        setUser({ ...user, titlesearch: blobUrl })
        toast.success('Title search uploaded successfully')
      }
    } catch (error) {
      toast.error(`Failed to upload ${docType === 'id' ? 'ID' : docType === 'rates' ? 'rates notice' : 'title search'}`)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setError(null)
    try {
      const method = user.id === 0 ? 'POST' : 'PUT'
      const userDataToSave = prepareUserForSave(user)
      const response = await fetch('https://buysel.azurewebsites.net/api/user', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataToSave),
      })

      if (response.ok) {
        if (user.id === 0) {
          const savedUser = await response.json()
          setUser(savedUser)
        }
        updateCompletedTabs(user)
        toast.success('Profile saved successfully!')
      } else {
        toast.error('Failed to save profile')
        setError('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Failed to save profile')
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const getCurrentTabIndex = () => tabs.findIndex(tab => tab.id === activeTab)
  
  const prepareUserForSave = (userData: User) => {
    return {
      ...userData,
      dateofbirth: userData.dateofbirth ? (userData.dateofbirth instanceof Date ? userData.dateofbirth.toISOString() : userData.dateofbirth) : null,
      dte: userData.dte instanceof Date ? userData.dte.toISOString() : userData.dte,
      idverified: userData.idverified ? (userData.idverified instanceof Date ? userData.idverified.toISOString() : userData.idverified) : null,
      ratesnoticeverified: userData.ratesnoticeverified ? (userData.ratesnoticeverified instanceof Date ? userData.ratesnoticeverified.toISOString() : userData.ratesnoticeverified) : null,
      titlesearchverified: userData.titlesearchverified ? (userData.titlesearchverified instanceof Date ? userData.titlesearchverified.toISOString() : userData.titlesearchverified) : null
    }
  }

  const saveAndSwitchTab = async (newTab: string) => {
    if (!user || saving) return
    
    // Save current changes
    setSaving(true)
    try {
      const method = user.id === 0 ? 'POST' : 'PUT'
      const userDataToSave = prepareUserForSave(user)
      const response = await fetch('https://buysel.azurewebsites.net/api/user', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataToSave),
      })

      if (response.ok) {
        if (user.id === 0) {
          const savedUser = await response.json()
          setUser(savedUser)
        }
        updateCompletedTabs(user)
        toast.success('Changes saved')
        setActiveTab(newTab)
      } else {
        const errorText = await response.text()
        console.error('Save failed:', response.status, errorText)
        toast.error('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }
  
  const goToNextTab = async () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex < tabs.length - 1) {
      await saveAndSwitchTab(tabs[currentIndex + 1].id)
    }
  }
  
  const goToPreviousTab = async () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex > 0) {
      await saveAndSwitchTab(tabs[currentIndex - 1].id)
    }
  }

  if (!isOpen) return null

  const renderTabContent = () => {
    if (!user) return null

    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={user.firstname}
                  onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  placeholder="Legal first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={user.middlename || ''}
                  onChange={(e) => setUser({ ...user, middlename: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  placeholder="Middle name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={user.lastname}
                  onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  placeholder="Legal last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formatDateForInput(user.dateofbirth)}
                  onChange={(e) => setUser({ ...user, dateofbirth: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={user.mobile}
                  onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  placeholder="+61 4XX XXX XXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="inline w-4 h-4 mr-1" />
                Residential Address *
              </label>
              <input
                ref={addressInputRef}
                type="text"
                value={user.address}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="Start typing your address..."
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                Australian Residency Status *
              </label>
              <select
                value={user.residencystatus || ''}
                onChange={(e) => setUser({ ...user, residencystatus: e.target.value as User['residencystatus'] })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                required
              >
                <option value="">Select status</option>
                <option value="citizen">Australian Citizen</option>
                <option value="permanent">Permanent Resident</option>
                <option value="temporary">Temporary Resident</option>
                <option value="foreign">Foreign Resident</option>
              </select>
            </div>
          </div>
        )

      /* case 'tax':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Tax information is required for capital gains tax reporting and withholding obligations.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Tax File Number (TFN)
              </label>
              <input
                type="text"
                value={user.tfn || ''}
                onChange={(e) => setUser({ ...user, tfn: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="XXX XXX XXX"
                maxLength={11}
              />
              <p className="text-xs text-gray-500 mt-1">Required for tax reporting (unless you have an ABN)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Australian Business Number (ABN)
              </label>
              <input
                type="text"
                value={user.abn || ''}
                onChange={(e) => setUser({ ...user, abn: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="XX XXX XXX XXX"
                maxLength={14}
              />
              <p className="text-xs text-gray-500 mt-1">Required if selling as a business or trust</p>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.foreignresident}
                  onChange={(e) => setUser({ ...user, foreignresident: e.target.checked })}
                  className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  I am a foreign resident for Australian tax purposes
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                This affects CGT withholding rules and tax obligations
              </p>
            </div>
          </div>
        ) */

      case 'legal':
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Legal Declaration:</strong> This information is required to verify your legal capacity to enter into contracts.
              </p>
            </div>

            {/* <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.over18}
                  onChange={(e) => setUser({ ...user, over18: e.target.checked })}
                  className="w-4 h-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  I confirm that I am 18 years or older and can legally enter into contracts *
                </span>
              </label>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Heart className="inline w-4 h-4 mr-1" />
                Marital Status *
              </label>
              <select
                value={user.maritalstatus || ''}
                onChange={(e) => setUser({ ...user, maritalstatus: e.target.value === '' ? null : e.target.value as User['maritalstatus'] })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                required
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="defacto">De Facto</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">May affect property ownership in some states</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Power of Attorney Details
              </label>
              <textarea
                value={user.powerofattorney || ''}
                onChange={(e) => setUser({ ...user, powerofattorney: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                rows={3}
                placeholder="If someone has power of attorney to act on your behalf, please provide details..."
              />
            </div>
          </div>
        )

      /* case 'banking':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Settlement Details:</strong> These banking details will be used for the transfer of settlement proceeds.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BSB Number *
              </label>
              <input
                type="text"
                value={user.bsb || ''}
                onChange={(e) => setUser({ ...user, bsb: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="XXX-XXX"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={user.accountnumber || ''}
                onChange={(e) => setUser({ ...user, accountnumber: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="Account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                value={user.accountname || ''}
                onChange={(e) => setUser({ ...user, accountname: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                placeholder="Name as it appears on the account"
              />
              <p className="text-xs text-gray-500 mt-1">Must match your legal name</p>
            </div>
          </div>
        ) */

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Identity & Property Verification:</strong> Please upload all required documents to verify your identity and property ownership.
              </p>
            </div>

            {/* Government ID Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Government ID
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type *
                  </label>
                  <select
                    value={user.idtype || 'none'}
                    onChange={(e) => setUser({ ...user, idtype: e.target.value as User['idtype'] })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  >
                    <option value="none">Select ID type</option>
                    <option value="passport">Passport</option>
                    <option value="driver">Driver&apos;s License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload ID Document *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {idPreview ? (
                      <div className="space-y-4">
                        {idPreview.startsWith('data:application/pdf') ? (
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">PDF Document Uploaded</p>
                          </div>
                        ) : (
                          <img 
                            src={idPreview} 
                            alt="ID Document" 
                            className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                            style={{ maxHeight: '300px' }}
                          />
                        )}
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Replace
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="mt-4 px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                        >
                          Select File
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileSelect(e, 'id')}
                      className="hidden"
                    />
                  </div>
                </div>

                {user.idverified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      Verified: {new Date(user.idverified).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rates Notice Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Current Rates Notice
              </h3>
              <p className="text-sm text-gray-600 mb-4">Proof of address & ownership</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {ratesNoticePreview ? (
                  <div className="space-y-4">
                    {ratesNoticePreview.startsWith('data:application/pdf') ? (
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">PDF Document Uploaded</p>
                      </div>
                    ) : (
                      <img 
                        src={ratesNoticePreview} 
                        alt="Rates Notice" 
                        className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                        style={{ maxHeight: '300px' }}
                      />
                    )}
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => ratesNoticeInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    <button
                      onClick={() => ratesNoticeInputRef.current?.click()}
                      disabled={uploading}
                      className="mt-4 px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                )}
                <input
                  ref={ratesNoticeInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileSelect(e, 'rates')}
                  className="hidden"
                />
              </div>

              {user.ratesnoticeverified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 mt-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    Verified: {new Date(user.ratesnoticeverified).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Title Search Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Title Search Document
              </h3>
              <p className="text-sm text-gray-600 mb-4">Proof of ownership</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {titleSearchPreview ? (
                  <div className="space-y-4">
                    {titleSearchPreview.startsWith('data:application/pdf') ? (
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">PDF Document Uploaded</p>
                      </div>
                    ) : (
                      <img 
                        src={titleSearchPreview} 
                        alt="Title Search" 
                        className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                        style={{ maxHeight: '300px' }}
                      />
                    )}
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => titleSearchInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    <button
                      onClick={() => titleSearchInputRef.current?.click()}
                      disabled={uploading}
                      className="mt-4 px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                )}
                <input
                  ref={titleSearchInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileSelect(e, 'title')}
                  className="hidden"
                />
              </div>

              {user.titlesearchverified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 mt-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    Verified: {new Date(user.titlesearchverified).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isCompleted = completedTabs.has(tab.id)
              return (
                <button
                  key={tab.id}
                  onClick={() => tab.id !== activeTab && saveAndSwitchTab(tab.id)}
                  disabled={saving}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#FF6600] text-[#FF6600]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              {renderTabContent()}
            </>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={goToPreviousTab}
            disabled={getCurrentTabIndex() === 0 || saving}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF5500] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>

          <button
            onClick={goToNextTab}
            disabled={getCurrentTabIndex() === tabs.length - 1 || saving}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}