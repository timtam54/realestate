// Configuration for client-side environment variables
// These values are embedded at build time by Next.js

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://buysel.azurewebsites.net',
  },
  azure: {
    blobSasToken: process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN || '',
    blobSasUrlBase: process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || '',
    blobContainer: process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || '',
  },
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API || '',
  },
  vapid: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  }
}

// API Base URL - centralized for all API calls
export const API_BASE_URL = config.api.baseUrl

// API Endpoints - centralized endpoint definitions
export const API_ENDPOINTS = {
  // User
  USER: `${API_BASE_URL}/api/user`,
  USER_BY_ID: (id: number | string) => `${API_BASE_URL}/api/user/${id}`,
  USER_BY_EMAIL: (email: string) => `${API_BASE_URL}/api/user/email/${encodeURIComponent(email)}`,
  USER_OAUTH: `${API_BASE_URL}/api/users/oauth`,
  SELLERS: `${API_BASE_URL}/api/user/sellers/`,

  // Property
  PROPERTY: `${API_BASE_URL}/api/property`,
  PROPERTY_BY_ID: (id: number | string) => `${API_BASE_URL}/api/property/${id}`,
  PROPERTY_BY_SELLER: (id: number | string) => `${API_BASE_URL}/api/property/seller/${id}`,
  PROPERTY_BY_SELLER_EMAIL: (email: string) => `${API_BASE_URL}/api/property/sellerusername/${encodeURIComponent(email)}`,
  PROPERTY_SEARCH: (postcode: string, beds: number, baths: number) =>
    `${API_BASE_URL}/api/property/postsubbedbath/${postcode}/${beds}/${baths}`,
  PROPERTY_SEARCH_WITH_USER: (postcode: string, beds: number, baths: number, user: string) =>
    `${API_BASE_URL}/api/property/postsubbedbath/${postcode}/${beds}/${baths}/${encodeURIComponent(user)}`,
  PROPERTY_ALL: `${API_BASE_URL}/api/property/all/`,
  PROPERTY_FAVS: (userId: number | string) => `${API_BASE_URL}/api/property/favs/${userId}`,

  // Property Photos
  PROPERTY_PHOTO: `${API_BASE_URL}/api/propertyphoto`,
  PROPERTY_PHOTO_BY_ID: (id: number | string) => `${API_BASE_URL}/api/propertyphoto/${id}`,
  PROPERTY_PHOTO_DOCS: (id: number | string) => `${API_BASE_URL}/api/propertyphoto/docs/${id}`,

  // Conversations
  CONVERSATION: `${API_BASE_URL}/api/conversation`,
  CONVERSATION_BY_ID: (id: number | string) => `${API_BASE_URL}/api/conversation/${id}`,
  CONVERSATION_BY_USER: (userId: number | string) => `${API_BASE_URL}/api/conversation/user/${userId}`,
  CONVERSATION_UNREAD: (userId: number | string) => `${API_BASE_URL}/api/conversation/unread/${userId}`,

  // Messages
  MESSAGE: `${API_BASE_URL}/api/message`,
  MESSAGE_BY_ID: (id: number | string) => `${API_BASE_URL}/api/message/${id}`,
  MESSAGE_BY_CONVERSATION: (conversationId: number | string) =>
    `${API_BASE_URL}/api/message/conversation/${conversationId}`,
  MESSAGE_UNREAD: (userId: number | string) => `${API_BASE_URL}/api/message/unread/${userId}`,
  MESSAGE_UNREAD_BY_CONV: (userId: number | string, conversationId: number | string) =>
    `${API_BASE_URL}/api/message/unread/${userId}/${conversationId}`,
  MESSAGE_MARK_READ: (userId: number | string, conversationId: number | string) =>
    `${API_BASE_URL}/api/message/markread/${userId}/${conversationId}`,

  // Offers
  OFFER: `${API_BASE_URL}/api/offer`,
  OFFER_BY_ID: (id: number | string) => `${API_BASE_URL}/api/offer/${id}`,
  OFFER_BY_PROPERTY: (propertyId: number | string) => `${API_BASE_URL}/api/offer/property/${propertyId}`,
  OFFER_BY_BUYER: (buyerId: number | string) => `${API_BASE_URL}/api/offer/buyer/${buyerId}`,
  OFFER_BY_SELLER: (sellerId: number | string) => `${API_BASE_URL}/api/offer/seller/${sellerId}`,
  OFFER_COUNTER: (id: number | string) => `${API_BASE_URL}/api/offer/${id}/counter`,

  // Offer Conditions
  OFFER_CONDITION: `${API_BASE_URL}/api/offercondition`,
  OFFER_CONDITION_BY_OFFER: (offerId: number | string) => `${API_BASE_URL}/api/offercondition/${offerId}`,
  OFFER_CONDITION_SATISFY: (id: number | string) => `${API_BASE_URL}/api/offercondition/${id}/satisfy`,

  // Favourites
  USER_PROPERTY_FAV: `${API_BASE_URL}/api/userpropertyfav`,
  USER_PROPERTY_FAV_BY_USER: (userId: number | string) => `${API_BASE_URL}/api/userpropertyfav/${userId}`,

  // Push Subscriptions
  PUSH_SUBSCRIPTION: `${API_BASE_URL}/api/push/push_subscription`,
  PUSH_SUBSCRIPTION_BY_EMAIL: (email: string) =>
    `${API_BASE_URL}/api/push/push_subscription/email/${encodeURIComponent(email)}`,
  PUSH_SUBSCRIPTION_BY_ID: (id: number | string) => `${API_BASE_URL}/api/push/push_subscription/${id}`,

  // Audit
  AUDIT: `${API_BASE_URL}/api/audit`,
  AUDIT_BY_PROPERTY: (propertyId: number | string) => `${API_BASE_URL}/api/audit/${propertyId}`,
  AUDIT_SUMMARY: `${API_BASE_URL}/api/audit/summary/`,
  AUDIT_CLEAR: `${API_BASE_URL}/api/audit/clearaudit`,

  // Buyer Documents
  PROPERTY_BUYER_DOC: `${API_BASE_URL}/api/propertybuyerdoc`,
  PROPERTY_BUYER_DOC_BY_ID: (id: number | string) => `${API_BASE_URL}/api/propertybuyerdoc/${id}`,
  PROPERTY_BUYER_DOC_ALL: `${API_BASE_URL}/api/propertybuyerdoc/all/`,

  // Badges
  BADGE: `${API_BASE_URL}/api/badge`,
} as const

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000 // 30 seconds

// Helper function to build Azure Blob URLs
export function getAzureBlobUrl(filename: string): string {
  const { blobSasUrlBase, blobContainer, blobSasToken } = config.azure

  if (!blobSasUrlBase || !blobContainer || !blobSasToken) {
    console.error('Azure Blob configuration is missing')
    return ''
  }

  return `${blobSasUrlBase}/${blobContainer}/${filename}?${blobSasToken}`
}