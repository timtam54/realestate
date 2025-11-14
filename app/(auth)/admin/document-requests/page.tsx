'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Calendar, Home, ShoppingCart, CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import AdminHeader from '@/components/AdminHeader'
import { Property } from '@/types/property'
import { Conversation } from '@/types/conversation'
import { Message } from '@/types/message'
import { usePageView } from '@/hooks/useAudit'

interface PropertyBuyerDoc {
  id: number
  propertyid: number
  dte: string
  buyerid: number
  requestdoc: string
  action: string | null
}

export interface Buyer {
  id: number
  email: string
  firstname: string
  lastname: string
}

export default function AdminDocumentRequestsPage() {
  usePageView('admin-document-requests')
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<PropertyBuyerDoc[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [processingDocId, setProcessingDocId] = useState<number | null>(null)

  // Check authentication
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push('/')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    fetchDocuments()
    fetchProperties()
    fetchBuyers()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://buysel.azurewebsites.net/api/propertybuyerdoc/all')
      if (response.ok) {
        const data: PropertyBuyerDoc[] = await response.json()
        setDocuments(data)
      } else {
        console.error('Failed to fetch document requests')
      }
    } catch (error) {
      console.error('Error fetching document requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch('https://buysel.azurewebsites.net/api/property/all')
      if (response.ok) {
        const data: Property[] = await response.json()
        setProperties(data)
      } else {
        console.error('Failed to fetch properties')
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchBuyers = async () => {
    try {
      const ep='https://buysel.azurewebsites.net/api/user';
     // alert(ep)
      const response = await fetch(ep)

      if (response.ok) {
        const data: Buyer[] = await response.json()
       // alert(JSON.stringify(data))
        setBuyers(data)
      } else {
        alert('Failed to fetch buyers')
      }
    } catch (error) {
      console.error('Error fetching buyers:', error)
    }
  }

  const handleActionUpdate = async (doc: PropertyBuyerDoc, action: 'Approve' | 'Reject') => {
    setProcessingDocId(doc.id)
    try {
      const updatedDoc = { ...doc, action }
      const response = await fetch('https://buysel.azurewebsites.net/api/propertybuyerdoc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDoc),
      })

      if (response.ok) {
        // Update local state
        setDocuments(documents.map(d => d.id === doc.id ? updatedDoc : d))

        // Get property details for the message
        const property = properties.find(p => p.id === doc.propertyid)
        const propertyTitle = property?.title || `Property #${doc.propertyid}`

        // Get current user (admin/seller) details from session
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          console.error('Failed to get session')
          return
        }
        const sessionData = await sessionResponse.json()
        const currentUserEmail = sessionData.user?.email

        if (!currentUserEmail) {
          console.error('No user email in session')
          return
        }

        // Get current user's numeric ID from email
        const userResponse = await fetch(`https://buysel.azurewebsites.net/api/user/email/${encodeURIComponent(currentUserEmail)}`)
        if (!userResponse.ok) {
          console.error('Failed to get user by email')
          return
        }
        const userData = await userResponse.json()
        const sellerId = userData.id

        // Create conversation (buyer_id = doc.buyerid, seller_id = current user)
        const conversationPayload: Omit<Conversation, 'created_at' | 'updated_at'> = {
          id: 0, // New conversation
          property_id: doc.propertyid,
          buyer_id: doc.buyerid,
          seller_id: sellerId
        }

        const conversationResponse = await fetch('https://buysel.azurewebsites.net/api/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conversationPayload)
        })

        if (!conversationResponse.ok) {
          console.error('Failed to create conversation')
          return
        }

        const conversationData = await conversationResponse.json()
        const conversationId = conversationData.id

        
        // Create message
        const messageContent = action === 'Approve'
          ? `Your document request for "${doc.requestdoc}" has been approved for property: ${propertyTitle}`
          : `Your document request for "${doc.requestdoc}" has been rejected for property: ${propertyTitle}`

        // Fetch property to get blob URL if approving
        let bloburl: string | null = null
        if (action === 'Approve') {
          try {
            const propertyResponse = await fetch(`https://buysel.azurewebsites.net/api/property/${doc.propertyid}`)
            if (propertyResponse.ok) {
              const propertyData:Property = await propertyResponse.json()

              if (propertyData) {
                // Set bloburl based on document type
                if (doc.requestdoc === 'Building') {
                  bloburl = propertyData.buildinginspazureblob || null
                } else if (doc.requestdoc === 'Pest') {
                  bloburl = propertyData.pestinspazureblob || null
                } else if (doc.requestdoc === 'Title or Council' ||doc.requestdoc === 'Title' || doc.requestdoc === 'Council') {
                  bloburl = propertyData.titlesrchcouncilrateazureblob || null
                }
              } else {
                console.error('Property data is null for propertyid:', doc.propertyid)
              }
            } else {
              console.error('Failed to fetch property, status:', propertyResponse.status)
            }
          } catch (error) {
            console.error('Failed to fetch property for blob URL:', error)
          }
        }

        const messagePayload: Message = {
          id: 0, // New message
          conversation_id: conversationId,
          sender_id: sellerId,
          content: messageContent,
          read_at: null, // Set to null so recipient sees it as unread
          created_at: new Date(),
          bloburl: bloburl
        }
        const jsn=JSON.stringify(messagePayload)
       // alert(jsn)
        const messageResponse = await fetch('https://buysel.azurewebsites.net/api/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsn
        })

        if (messageResponse.ok) {
          console.log('Message sent to buyer successfully')

          // Send push notification to buyer
          try {
            const pushResponse = await fetch('/api/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: doc.buyerid,
                payload: {
                  title: action === 'Approve'
                    ? 'Document Request Approved'
                    : 'Document Request Update',
                  body: messageContent,
                  url: `/buyer/messages?conversationId=${conversationId}`,
                  conversationId: conversationId,
                  propertyId: doc.propertyid
                }
              })
            })

            if (pushResponse.ok) {
              console.log('Push notification sent successfully')
            } else {
              const errorText = await pushResponse.text()
              console.error('Failed to send push notification:', errorText)
            }
          } catch (pushError) {
            console.error('Error sending push notification:', pushError)
            // Don't fail the whole request if push fails
          }
        } else {
          const errorText = await messageResponse.text()
          console.error('Failed to send message to buyer:', errorText)
        }

      } else {
        console.error('Failed to update document request')
        alert('Failed to update document request')
      }
    } catch (error) {
      console.error('Error updating document request:', error)
      alert('Error updating document request')
    } finally {
      setProcessingDocId(null)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery &&
        !doc.requestdoc.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !doc.propertyid.toString().includes(searchQuery) &&
        !doc.buyerid.toString().includes(searchQuery)) return false
    return true
  })

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the page content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} isAuthenticated={isAuthenticated} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Buyer Request for Documents</h1>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by document type, property ID, or buyer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchDocuments}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Document Requests Table/Cards */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center">
              <Loader2 className="animate-spin h-8 w-8 text-red-600" />
              <span className="ml-3 text-gray-600">Loading document requests...</span>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No document requests found</h3>
            <p className="text-gray-600">Try adjusting your search filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action/Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{new Date(doc.dte).toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/listings?id=${doc.propertyid}`}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          {properties.find(i => i.id === doc.propertyid)?.title || `Property #${doc.propertyid}`}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/users?id=${doc.buyerid}`}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {buyers.find(i => i.id === doc.buyerid)
                            ? `${buyers.find(i => i.id === doc.buyerid)!.firstname} ${buyers.find(i => i.id === doc.buyerid)!.lastname}`
                            : `Buyer #${doc.buyerid}`}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doc.requestdoc}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.action && doc.action !== '' ? (
                          <div className="flex items-center">
                            {doc.action === 'Reject' ? (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-200 text-red-700">
                                  {doc.action}
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {doc.action}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleActionUpdate(doc, 'Approve')}
                              disabled={processingDocId === doc.id}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingDocId === doc.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleActionUpdate(doc, 'Reject')}
                              disabled={processingDocId === doc.id}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingDocId === doc.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="lg:hidden space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    {/* Header with Status */}
                    <div className="flex items-end justify-end mb-3 pb-3 border-b border-gray-200">
                      {doc.action && doc.action !== '' ? (
                        <div className="flex items-center">
                          {doc.action === 'Reject' ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-700">
                                {doc.action}
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {doc.action}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleActionUpdate(doc, 'Approve')}
                            disabled={processingDocId === doc.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingDocId === doc.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleActionUpdate(doc, 'Reject')}
                            disabled={processingDocId === doc.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingDocId === doc.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500 block mb-0.5">Requested</span>
                          <span className="text-gray-900 font-medium">{new Date(doc.dte).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Document Type */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Document Type</span>
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doc.requestdoc}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Property and Buyer Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <Home className="h-3 w-3 mr-1" />
                          Property
                        </div>
                        <Link
                          href={`/admin/listings?id=${doc.propertyid}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {properties.find(i => i.id === doc.propertyid)?.title || `#${doc.propertyid}`}
                        </Link>
                      </div>
                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Buyer
                        </div>
                        <Link
                          href={`/admin/users?id=${doc.buyerid}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {buyers.find(i => i.id === doc.buyerid)
                            ? `${buyers.find(i => i.id === doc.buyerid)!.firstname} ${buyers.find(i => i.id === doc.buyerid)!.lastname}`
                            : `#${doc.buyerid}`}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stats Summary - Moved to Bottom */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{documents.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {documents.filter(d => !d.action || d.action === '').length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {documents.filter(d => d.action && d.action !== '').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
