/**
 * @fileoverview Centralized configuration for the BuySel real estate application.
 *
 * This module provides:
 * - Environment-based configuration (NEXT_PUBLIC_* vars embedded at build time)
 * - Centralized API endpoint definitions (API_ENDPOINTS)
 * - Azure Blob Storage URL construction
 * - Request timeout settings
 *
 * @example
 * // Import and use API endpoints
 * import { API_ENDPOINTS, API_BASE_URL } from '@/lib/config'
 *
 * // Static endpoint
 * fetch(API_ENDPOINTS.USER)
 *
 * // Dynamic endpoint with parameters
 * fetch(API_ENDPOINTS.USER_BY_EMAIL(userEmail))
 *
 * @module lib/config
 */

/**
 * Application configuration object.
 * Values are read from environment variables at build time.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL
 * - NEXT_PUBLIC_AZUREBLOB_SASTOKEN: Azure Blob SAS token for file access
 * - NEXT_PUBLIC_AZUREBLOB_SASURL_BASE: Azure Blob storage base URL
 * - NEXT_PUBLIC_AZUREBLOB_CONTAINER: Azure Blob container name
 * - NEXT_PUBLIC_GOOGLE_MAP_API: Google Maps API key
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY: VAPID public key for web push notifications
 */
export const config = {
  api: {
    /** Backend API base URL. Default: Azure App Service */
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://buysel.azurewebsites.net',
  },
  azure: {
    /** SAS token for Azure Blob Storage access */
    blobSasToken: process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN || '',
    /** Azure Blob Storage base URL (e.g., https://account.blob.core.windows.net) */
    blobSasUrlBase: process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || '',
    /** Azure Blob container name for property photos */
    blobContainer: process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || '',
  },
  googleMaps: {
    /** Google Maps API key for geocoding and map display */
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API || '',
  },
  vapid: {
    /** VAPID public key for Web Push notification subscription */
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  }
}

/** API Base URL - use this for any endpoints not defined in API_ENDPOINTS */
export const API_BASE_URL = config.api.baseUrl

/**
 * Centralized API endpoint definitions.
 *
 * All API calls should use these endpoints instead of hardcoded URLs.
 * This enables easy environment switching via NEXT_PUBLIC_API_URL.
 *
 * Endpoint types:
 * - Static: Direct string (e.g., API_ENDPOINTS.USER)
 * - Dynamic: Function returning string (e.g., API_ENDPOINTS.USER_BY_ID(123))
 *
 * Backend: .NET 8 Minimal API (buyselwebapi)
 * Auth: JWT Bearer tokens via NextAuth.js
 */
export const API_ENDPOINTS = {
  // ==================== USER ENDPOINTS ====================
  /** GET: List all users, POST: Create user */
  USER: `${API_BASE_URL}/api/user`,
  /** GET: User by database ID */
  USER_BY_ID: (id: number | string) => `${API_BASE_URL}/api/user/${id}`,
  /** GET: User by email (used for login/profile lookup) */
  USER_BY_EMAIL: (email: string) => `${API_BASE_URL}/api/user/email/${encodeURIComponent(email)}`,
  /** POST: OAuth user registration/update */
  USER_OAUTH: `${API_BASE_URL}/api/users/oauth`,
  /** GET: List all sellers (users who have listings) */
  SELLERS: `${API_BASE_URL}/api/user/sellers/`,

  // ==================== PROPERTY ENDPOINTS ====================
  /** GET: Published properties, POST: Create property */
  PROPERTY: `${API_BASE_URL}/api/property`,
  /** GET/PUT/DELETE: Property by ID */
  PROPERTY_BY_ID: (id: number | string) => `${API_BASE_URL}/api/property/${id}`,
  /** GET: Properties by seller user ID */
  PROPERTY_BY_SELLER: (id: number | string) => `${API_BASE_URL}/api/property/seller/${id}`,
  /** GET: Properties by seller email */
  PROPERTY_BY_SELLER_EMAIL: (email: string) => `${API_BASE_URL}/api/property/sellerusername/${encodeURIComponent(email)}`,
  /** GET: Search properties. Use '~' for postcode to match all, 0 for beds/baths to match any */
  PROPERTY_SEARCH: (postcode: string, beds: number, baths: number) =>
    `${API_BASE_URL}/api/property/postsubbedbath/${postcode}/${beds}/${baths}`,
  /** GET: Search with audit logging for user */
  PROPERTY_SEARCH_WITH_USER: (postcode: string, beds: number, baths: number, user: string) =>
    `${API_BASE_URL}/api/property/postsubbedbath/${postcode}/${beds}/${baths}/${encodeURIComponent(user)}`,
  /** GET: All properties (admin only, includes drafts) */
  PROPERTY_ALL: `${API_BASE_URL}/api/property/all/`,
  /** GET: User's favorited properties */
  PROPERTY_FAVS: (userId: number | string) => `${API_BASE_URL}/api/property/favs/${userId}`,

  // ==================== PROPERTY PHOTO ENDPOINTS ====================
  /** GET: List photos, POST: Upload photo (multipart/form-data) */
  PROPERTY_PHOTO: `${API_BASE_URL}/api/propertyphoto`,
  /** GET/DELETE: Photo by ID */
  PROPERTY_PHOTO_BY_ID: (id: number | string) => `${API_BASE_URL}/api/propertyphoto/${id}`,
  /** GET: Document photos for property (building/pest reports, title search) */
  PROPERTY_PHOTO_DOCS: (id: number | string) => `${API_BASE_URL}/api/propertyphoto/docs/${id}`,

  // ==================== CONVERSATION ENDPOINTS ====================
  /** GET: All conversations, POST: Create conversation */
  CONVERSATION: `${API_BASE_URL}/api/conversation`,
  /** GET/DELETE: Conversation by ID */
  CONVERSATION_BY_ID: (id: number | string) => `${API_BASE_URL}/api/conversation/${id}`,
  /** GET: User's conversations (buyer-seller chat threads) */
  CONVERSATION_BY_USER: (userId: number | string) => `${API_BASE_URL}/api/conversation/user/${userId}`,
  /** GET: Count of unread conversations for user */
  CONVERSATION_UNREAD: (userId: number | string) => `${API_BASE_URL}/api/conversation/unread/${userId}`,

  // ==================== MESSAGE ENDPOINTS ====================
  /** POST: Send message in conversation */
  MESSAGE: `${API_BASE_URL}/api/message`,
  /** GET: Message by ID */
  MESSAGE_BY_ID: (id: number | string) => `${API_BASE_URL}/api/message/${id}`,
  /** GET: Messages in conversation (ordered by timestamp) */
  MESSAGE_BY_CONVERSATION: (conversationId: number | string) =>
    `${API_BASE_URL}/api/message/conversation/${conversationId}`,
  /** GET: Total unread message count for user */
  MESSAGE_UNREAD: (userId: number | string) => `${API_BASE_URL}/api/message/unread/${userId}`,
  /** GET: Unread message count in specific conversation */
  MESSAGE_UNREAD_BY_CONV: (userId: number | string, conversationId: number | string) =>
    `${API_BASE_URL}/api/message/unread/${userId}/${conversationId}`,
  /** PUT: Mark messages as read in conversation */
  MESSAGE_MARK_READ: (userId: number | string, conversationId: number | string) =>
    `${API_BASE_URL}/api/message/markread/${userId}/${conversationId}`,

  // ==================== OFFER ENDPOINTS ====================
  /** POST: Create offer on property */
  OFFER: `${API_BASE_URL}/api/offer`,
  /** GET/PUT/DELETE: Offer by ID */
  OFFER_BY_ID: (id: number | string) => `${API_BASE_URL}/api/offer/${id}`,
  /** GET: All offers on a property (for seller) */
  OFFER_BY_PROPERTY: (propertyId: number | string) => `${API_BASE_URL}/api/offer/property/${propertyId}`,
  /** GET: Offers made by buyer */
  OFFER_BY_BUYER: (buyerId: number | string) => `${API_BASE_URL}/api/offer/buyer/${buyerId}`,
  /** GET: Offers received by seller */
  OFFER_BY_SELLER: (sellerId: number | string) => `${API_BASE_URL}/api/offer/seller/${sellerId}`,
  /** POST: Counter-offer */
  OFFER_COUNTER: (id: number | string) => `${API_BASE_URL}/api/offer/${id}/counter`,

  // ==================== OFFER CONDITION ENDPOINTS ====================
  /** POST: Add condition to offer (finance, inspection, etc.) */
  OFFER_CONDITION: `${API_BASE_URL}/api/offercondition`,
  /** GET: Conditions for an offer */
  OFFER_CONDITION_BY_OFFER: (offerId: number | string) => `${API_BASE_URL}/api/offercondition/${offerId}`,
  /** PUT: Mark condition as satisfied */
  OFFER_CONDITION_SATISFY: (id: number | string) => `${API_BASE_URL}/api/offercondition/${id}/satisfy`,

  // ==================== FAVOURITES ENDPOINTS ====================
  /** POST: Add property to favorites */
  USER_PROPERTY_FAV: `${API_BASE_URL}/api/userpropertyfav`,
  /** GET/DELETE: User's favorites */
  USER_PROPERTY_FAV_BY_USER: (userId: number | string) => `${API_BASE_URL}/api/userpropertyfav/${userId}`,

  // ==================== PUSH NOTIFICATION ENDPOINTS ====================
  /** POST: Register web push subscription (VAPID) */
  PUSH_SUBSCRIPTION: `${API_BASE_URL}/api/push/push_subscription`,
  /** GET: Subscriptions by user email */
  PUSH_SUBSCRIPTION_BY_EMAIL: (email: string) =>
    `${API_BASE_URL}/api/push/push_subscription/email/${encodeURIComponent(email)}`,
  /** DELETE: Remove subscription */
  PUSH_SUBSCRIPTION_BY_ID: (id: number | string) => `${API_BASE_URL}/api/push/push_subscription/${id}`,

  // ==================== AUDIT ENDPOINTS ====================
  /** POST: Log audit event, GET: All audit logs */
  AUDIT: `${API_BASE_URL}/api/audit`,
  /** GET: Audit logs for property */
  AUDIT_BY_PROPERTY: (propertyId: number | string) => `${API_BASE_URL}/api/audit/${propertyId}`,
  /** GET: Audit summary (admin dashboard) */
  AUDIT_SUMMARY: `${API_BASE_URL}/api/audit/summary/`,
  /** DELETE: Clear all audit logs (admin only) */
  AUDIT_CLEAR: `${API_BASE_URL}/api/audit/clearaudit`,

  // ==================== BUYER DOCUMENT ENDPOINTS ====================
  /** POST: Request document access, GET: All document requests */
  PROPERTY_BUYER_DOC: `${API_BASE_URL}/api/propertybuyerdoc`,
  /** GET/PUT/DELETE: Document request by ID */
  PROPERTY_BUYER_DOC_BY_ID: (id: number | string) => `${API_BASE_URL}/api/propertybuyerdoc/${id}`,
  /** GET: All document requests (admin view) */
  PROPERTY_BUYER_DOC_ALL: `${API_BASE_URL}/api/propertybuyerdoc/all/`,

  // ==================== BADGE ENDPOINTS ====================
  /** GET: User badges/achievements */
  BADGE: `${API_BASE_URL}/api/badge`,
} as const

/** Request timeout in milliseconds for API calls */
export const REQUEST_TIMEOUT = 30000 // 30 seconds

/**
 * Constructs a full Azure Blob Storage URL with SAS token.
 *
 * Used for property photos stored in Azure Blob Storage.
 * The SAS token provides time-limited read access.
 *
 * @param filename - The blob filename (e.g., "property-123-photo-1.jpg")
 * @returns Full URL with SAS token, or empty string if config is missing
 *
 * @example
 * const imageUrl = getAzureBlobUrl(property.photoFilename)
 * <img src={imageUrl} alt="Property" />
 */
export function getAzureBlobUrl(filename: string): string {
  const { blobSasUrlBase, blobContainer, blobSasToken } = config.azure

  if (!blobSasUrlBase || !blobContainer || !blobSasToken) {
    console.error('Azure Blob configuration is missing')
    return ''
  }

  return `${blobSasUrlBase}/${blobContainer}/${filename}?${blobSasToken}`
}