'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  mobile: string
  address: string
  idbloburl: string
  idverified: string
  dte: Date
}

interface UserProfileProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

export default function UserProfile({ email, isOpen, onClose }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && email) {
      fetchUser()
    }
  }, [isOpen, email])

  useEffect(() => {
    if (isOpen && addressInputRef.current && !autocompleteRef.current) {
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
        if (!addressInputRef.current || !window.google) return

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: ['au'] },
          }
        )

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace()
          if (place.formatted_address && user) {
            setUser({ ...user, address: place.formatted_address })
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
  }, [isOpen, user])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`https://buysel.azurewebsites.net/api/user/email/${email}`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setUser(data)
        } else {
          setUser({
            id: 0,
            email,
            firstname: '',
            lastname: '',
            mobile: '',
            address: '',
            idbloburl: '',
            idverified: '',
            dte: new Date(),
          })
        }
      } else {
        setUser({
          id: 0,
          email,
          firstname: '',
          lastname: '',
          mobile: '',
          address: '',
          idbloburl: '',
          idverified: '',
          dte: new Date(),
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser({
        id: 0,
        email,
        firstname: '',
        lastname: '',
        mobile: '',
        address: '',
        idbloburl: '',
        idverified: '',
        dte: new Date(),
      })
      setError('Failed to load user profile - showing empty form')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError(null)
    const jsn = JSON.stringify(user)
    
    try {
      const method = user.id === 0 ? 'POST' : 'PUT'
      const response = await fetch('https://buysel.azurewebsites.net/api/user', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsn,
      })

      if (response.ok) {
        if (user.id === 0) {
          const savedUser = await response.json()
          setUser(savedUser)
        }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              {user && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstname}
                    onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastname}
                    onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={user.mobile}
                    onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Start typing your address..."
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              {user.idverified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">ID Verification Status:</span> {user.idverified}
                  </p>
                </div>
              )}
            </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
      </div>
    </div>
  )
}
