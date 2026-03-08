# BuySel Application - Handover Document

**Date:** March 2026
**Version:** 0.2.0
**Project:** Real Estate Matchmaker (BuySel)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Frontend (Next.js)](#4-frontend-nextjs)
5. [Backend (C# Web API)](#5-backend-c-web-api)
6. [Authentication](#6-authentication)
7. [Security](#7-security)
8. [Database & Data Models](#8-database--data-models)
9. [API Endpoints](#9-api-endpoints)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Environment Configuration](#11-environment-configuration)
12. [Build & Deployment](#12-build--deployment)
13. [Key Features](#13-key-features)
14. [Code Structure](#14-code-structure)
15. [Known Issues & TODOs](#15-known-issues--todos)
16. [Maintenance & Operations](#16-maintenance--operations)

---

## 1. Project Overview

BuySel is a **property buying and selling marketplace** designed for the **Queensland (Australia) market**. It enables direct communication between buyers and sellers, offer management with QLD standard conditions, and document verification.

### Core Functionality

- Property listing and search with map/list views
- Real-time messaging between buyers and sellers
- Offer management with conditional terms
- Document upload and verification
- Push notifications (PWA + iOS)
- Multi-provider OAuth authentication

### User Roles

| Role | Description |
|------|-------------|
| Buyer | Browse properties, message sellers, make offers |
| Seller | List properties, manage offers, chat with buyers |
| Conveyancer | Access property audits, verify documents |
| Admin | Manage listings, approve/reject properties |

---

## 2. Architecture

```
+---------------------------------------------------------------------+
|                         FRONTEND                                     |
|                   Next.js 15 (React 19)                             |
|              Azure Web App / Static Web Apps                         |
|                    Port: 3000                                        |
+------------------------------+--------------------------------------+
                               |
                               | HTTPS (JWT Auth)
                               |
+------------------------------v--------------------------------------+
|                         BACKEND                                      |
|              .NET 8 ASP.NET Core Minimal APIs                       |
|                  Azure App Service                                   |
|          https://buysel.azurewebsites.net                           |
+------------------------------+--------------------------------------+
                               |
              +----------------+----------------+
              |                |                |
              v                v                v
+------------------+  +----------------+  +------------------+
|  Azure SQL DB    |  |  Azure Blob    |  | External APIs    |
|   (Data Store)   |  |   Storage      |  | (OAuth, Maps)    |
+------------------+  +----------------+  +------------------+
```

### Communication Flow

1. Frontend authenticates via OAuth (Google/Microsoft/Facebook)
2. OAuth callback creates iron-session + generates JWT
3. JWT is passed to C# backend for authenticated API calls
4. C# backend validates JWT and processes requests
5. Data persisted to Azure SQL Database
6. Photos/documents stored in Azure Blob Storage

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.2 | React framework with App Router |
| React | 19.1.0 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 4.x | Styling |
| Radix UI | Various | Accessible component primitives |
| TanStack Query | 5.86.0 | Data fetching & caching |
| Zustand | 4.5.7 | State management |
| React Hook Form | 7.62.0 | Form handling |
| Zod | 3.25.76 | Schema validation |
| iron-session | Latest | Encrypted session cookies |
| jose | Latest | JWT handling |
| web-push | Latest | Push notifications |

### Backend (C# Web API)

| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8 | Runtime |
| ASP.NET Core | Minimal APIs | Web API framework |
| Entity Framework Core | 8.0.20 | ORM |
| Azure App Service | - | Hosting platform |
| Azure SQL Database | - | Data persistence |
| Azure Blob Storage | - | File storage |
| WebPush | 1.0.12 | Web push notifications |
| dotAPNS | 4.6.0 | iOS push notifications |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Azure Web App | Frontend hosting |
| Azure App Service | Backend hosting |
| Azure SQL Database | Relational data |
| Azure Blob Storage | Photos, documents |
| GitHub Actions | CI/CD pipeline |

---

## 4. Frontend (Next.js)

### Directory Structure

```
realestate/
+-- app/
|   +-- (auth)/              # Authenticated routes
|   |   +-- admin/           # Admin dashboard
|   |   +-- conveyancer/     # Conveyancer features
|   |   +-- seller/          # Seller dashboard
|   +-- (public)/            # Public routes
|   |   +-- buyer/           # Buyer features
|   |   |   +-- messages/    # Messaging interface
|   |   +-- comparables/     # Property comparisons
|   |   +-- page.tsx         # Home/search page
|   +-- api/                 # API routes
|   |   +-- auth/            # OAuth callbacks + CSRF
|   |   +-- chat/            # Messaging API
|   |   +-- comparables/     # Comparables API
|   |   +-- push/            # Push notifications
|   |   +-- audit/           # Audit logging
|   +-- layout.tsx           # Root layout
|   +-- globals.css          # Global styles
+-- components/              # React components
+-- context/                 # React context providers
+-- hooks/                   # Custom React hooks
+-- lib/                     # Utility libraries
|   +-- auth/                # Authentication utilities
|   |   +-- session.ts       # iron-session config
|   |   +-- csrf.ts          # CSRF protection
|   |   +-- jwt.ts           # JWT signing/verification
|   |   +-- auth-context.tsx # Auth context
|   +-- config.ts            # Centralized API endpoints
|   +-- server-api.ts        # Server-side fetch with auth
|   +-- secure-fetch.ts      # Fetch with timeout protection
|   +-- rate-limit.ts        # Rate limiting utility
|   +-- api-validation.ts    # Zod response validation schemas
|   +-- push-notifications.ts # Web push client utilities
+-- services/                # API service functions
+-- types/                   # TypeScript types
+-- public/                  # Static assets
|   +-- sw.js               # Service worker
|   +-- manifest.json       # PWA manifest
+-- scripts/                 # Build scripts
+-- docs/                    # Documentation
```

### Key Components

| Component | File | Description |
|-----------|------|-------------|
| BuySelHeader | `components/BuySelHeader.tsx` | Main navigation header |
| PropertyCard | `components/PropertyCard.tsx` | Property listing card |
| PropertyDetailsDialog | `components/PropertyDetailsDialog.tsx` | Property detail modal |
| ChatModal | `components/ChatModal.tsx` | Messaging interface |
| MakeOfferDialog | `components/MakeOfferDialog.tsx` | Offer submission |
| OffersList | `components/OffersList.tsx` | Offer management |
| UserProfile | `components/UserProfile.tsx` | Profile management |
| AddPropertyDialog | `components/AddPropertyDialog.tsx` | Property listing form |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Session and authentication state |
| `useUserData()` | Fetch/cache user profile (24hr TTL) |
| `useCsrf()` | CSRF token management for forms |
| `useAudit()` | Track page views and user actions |
| `useTimezoneCorrection()` | Handle timezone differences |
| `useUserCache()` | User data caching utility |

---

## 5. Backend (C# Web API)

### Base URL

```
Production: https://buysel.azurewebsites.net
Local Dev:  http://localhost:5005
```

### Project Structure

```
buyselwebapi/
  Program.cs                  # App entry point, middleware, DI, route mapping
  buyselwebapi.csproj         # Project file & dependencies
  appsettings.json            # App configuration
  data/
    dbcontext.cs              # EF Core DbContext with all DbSets
  model/
    user.cs                   # User, OAuthUserRequest
    property.cs               # Property, PropertyPic
    propertyphoto.cs          # PropertyPhoto
    badge.cs                  # Badge
    audit.cs                  # Audit, AudSummary
    Conversations.cs          # Conversation, ConversationCount, Message
    PushSubscription.cs       # PushSubscription (web + native)
    PropertyBuyerDoc.cs       # PropertyBuyerDoc
    userpropertyfavs.cs       # UserPropertyFav
    offer.cs                  # Offer
    OfferHistory.cs           # OfferHistory
    OfferCondition.cs         # OfferCondition
  endpoint/
    AuthHelper.cs             # Centralized auth: GetCurrentUser(), IsAdmin()
    userEP.cs                 # User CRUD + OAuth
    propertyEP.cs             # Property CRUD + search + geocoding
    propertyphotoEP.cs        # Property photo/document management
    badgeEP.cs                # Badge listing
    auditEP.cs                # Audit log viewing + management
    conversationEP.cs         # Buyer-seller conversations
    messageEP.cs              # Chat messages within conversations
    pushsubscriptionEP.cs     # Push notification subscriptions
    propertybuyerdocEP.cs     # Buyer document requests
    userpropertyfavEP.cs      # Property favourites
    offerEP.cs                # Offers + counter-offers
    offerConditionEP.cs       # Offer conditions/contingencies
    offerHistoryEP.cs         # Offer audit trail
```

### Running Locally

```bash
# Start the API on port 5005
cd buyselwebapi-main
dotnet run

# With HTTPS (port 7188)
dotnet run --launch-profile https
```

Swagger UI available at `/swagger` (development only).

---

## 6. Authentication

### OAuth Providers

| Provider | Callback URL |
|----------|--------------|
| Google | `/api/auth/google/callback` |
| Microsoft | `/api/auth/microsoft/callback` |

### Authentication Flow

```
1. User clicks "Sign in with Google" or "Sign in with Microsoft"
         |
         v
2. Redirect to OAuth provider
         |
         v
3. User authorizes application
         |
         v
4. Provider redirects to callback URL with auth code
         |
         v
5. Callback handler exchanges code for access token
         |
         v
6. Fetch user info from OAuth provider
         |
         v
7. Create/update user in C# backend via /api/users/oauth
         |
         v
8. Create iron-session cookie with user data
         |
         v
9. Redirect to authenticated page
```

### Session Management (Frontend)

- **Library:** iron-session
- **Cookie name:** `buysel_session`
- **Max age:** 30 days
- **Flags:** Secure, HttpOnly, SameSite=Lax

### JWT Configuration

```
Algorithm: HS256
Issuer: BuySell
Audience: CharterTowers
Expiration: 1 hour
```

The frontend generates JWTs via `/api/auth/token` for C# backend calls:

```typescript
// JWT Payload
{
  sub: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  provider: user.provider,
  iat: timestamp,
  exp: timestamp + 3600
}
```

### Backend Auth Helper (`AuthHelper.cs`)

Centralized authentication utility:
- `GetCurrentUserEmail(ClaimsPrincipal)` - Extracts email from JWT claims
- `GetCurrentUser(ClaimsPrincipal, dbcontext)` - Looks up User record by email
- `IsAdmin(ClaimsPrincipal, dbcontext)` - Returns true if user has `admin == true`

---

## 7. Security

### Frontend Security

#### Security Headers (next.config.ts)

Production-only security headers applied to all routes:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` |
| `Content-Security-Policy` | Strict CSP (production only) |

**Note:** CSP is disabled in development to avoid blocking external API calls during testing.

#### Rate Limiting (middleware.ts)

Edge-compatible rate limiting middleware protects all API routes:

| Route Pattern | Limit |
|---------------|-------|
| `/api/auth/*` | 10 requests/minute |
| `/api/chat/*` | 60 requests/minute |
| `/api/push/*` | 30 requests/minute |
| `/api/comparables` | 10 requests/minute |
| `/api/*` (default) | 100 requests/minute |

Returns HTTP 429 with `Retry-After` header when exceeded.

#### CSRF Protection
All mutating API routes (POST, PUT, DELETE, PATCH) are protected with CSRF tokens:

```typescript
// lib/auth/csrf.ts
- generateCsrfToken() - Creates 64-char random token
- getCsrfToken() - Gets/creates token in session
- setCsrfCookie() - Sets token in browser-readable cookie
- validateCsrfToken() - Validates X-CSRF-Token header
- requireCsrf() - Middleware helper for routes
```

**Excluded paths:** OAuth callbacks, Facebook data deletion webhook

**Client-side usage:**
```typescript
import { useCsrf } from '@/hooks/useCsrf'

const { fetchWithCsrf } = useCsrf()
await fetchWithCsrf('/api/chat', { method: 'POST', body: JSON.stringify(data) })
```

#### Secure Fetch Utility (lib/secure-fetch.ts)

Fetch wrapper with timeout protection for external API calls:

```typescript
import { secureFetch } from '@/lib/secure-fetch'

// Default 10-second timeout
const response = await secureFetch(url, { timeout: 15000 })
```

- Automatic timeout (default 10s, max 60s)
- Custom error types: `FetchTimeoutError`, `FetchNetworkError`
- Safe error messages for client responses

#### Input Validation
All API routes validate input with Zod schemas before processing:
- `/api/chat` - chatPostSchema, chatGetParamsSchema
- `/api/push/send` - pushSendSchema
- `/api/audit` - auditSchema
- `/api/comparables` - comparablesSchema (URL whitelist: homely.com.au, domain.com.au, realestate.com.au)

#### Response Validation (lib/api-validation.ts)

Zod schemas for validating backend API responses:
- `userSchema` - User data validation
- `propertySchema` - Property data validation
- `conversationSchema` - Conversation data validation
- `messageSchema` - Message data validation
- `safeParseResponse()` - Parse with null on failure
- `parseResponse()` - Parse with exception on failure

### Backend Security

#### Rate Limiting
- **Auth endpoints** (`/api/users/oauth`, `POST /api/user/`): 10 requests/minute per client
- **General endpoints**: 60 requests/minute per client
- Returns HTTP 429 when exceeded

#### Security Headers
Applied to all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

#### Authorization
All endpoints require authorization by default. Anonymous endpoints:
- `POST /api/users/oauth` (OAuth login/register)
- `POST /api/user/` (registration)
- `POST /api/audit/` (analytics tracking)
- `GET /api/property/` (browse published properties)
- `GET /api/property/{id}` (view single property)
- Property search endpoints

#### Ownership/Access Control
- **Users**: Can only view/update their own profile. Cannot self-promote to admin.
- **Properties**: Only the seller (or admin) can update/delete.
- **Conversations**: Only participants (buyer or seller) can view/send messages.
- **Offers**: Only buyer or property seller can view/modify.
- **Admin-only**: Audit logs, user listing, property /all/

#### SQL Injection Prevention
- All raw SQL uses `FromSqlInterpolated()` (parameterized queries)
- No `FromSqlRaw()` with string concatenation

---

## 8. Database & Data Models

### Connection
- **Server**: `buyselserver.database.windows.net`
- **Database**: `buysel`
- **ORM**: Entity Framework Core 8

### DbContext Entity Sets

| DbSet | Model | Table |
|-------|-------|-------|
| `user` | User | Users |
| `property` | Property | Properties |
| `propertyphoto` | PropertyPhoto | Property photos |
| `badge` | Badge | Badges |
| `audit` | Audit | Audit log |
| `audsummary` | AudSummary | Audit summary (read-only) |
| `conversation` | Conversation | Buyer-seller conversations |
| `conversationcount` | ConversationCount | Unread counts (read-only) |
| `message` | Message | Chat messages |
| `pushsubscriptions` | PushSubscription | Push notification registrations |
| `propertybuyerdoc` | PropertyBuyerDoc | Document requests |
| `userpropertyfav` | UserPropertyFav | Favourited properties |
| `offer` | Offer | Purchase offers |
| `offercondition` | OfferCondition | Offer contingencies |
| `offerhistory` | OfferHistory | Offer change log |

### User Model

```typescript
interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  address?: string;
  dateofbirth?: string;
  idbloburl?: string;
  idverified?: boolean;
  picture?: string;
  provider: 'google' | 'microsoft' | 'facebook';
  role?: string;
  admin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Property Model

```typescript
interface Property {
  id: number;
  title: string;
  address: string;
  suburb?: string;
  postcode?: string;
  state?: string;
  country?: string;
  price: number;
  lat: number;
  lon: number;
  photobloburl?: string;
  typeofprop: "House" | "Apartment" | "Townhouse" | "Land" | "Rural" | "Commercial";
  beds?: number;
  baths?: number;
  carspaces?: number;
  landsize?: number;
  buildyear?: number;
  sellerid: number;
  status?: string;
  rejectedreason?: string;

  // Document verification
  buildinginspazureblob?: string;
  buildinginspverified?: boolean;
  pestinspazureblob?: string;
  pestinspverified?: boolean;
  titlesrchcouncilrateazureblob?: string;
  titlesrchcouncilrateverified?: boolean;

  // Public visibility
  buildinginsppublic?: boolean;
  pestinsppublic?: boolean;
  titlesrchcouncilratepublic?: boolean;
}
```

### Offer Model

```typescript
interface Offer {
  id: number;
  property_id: number;
  buyer_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'expired';
  offer_amount: number;
  deposit_amount?: number;
  settlement_days?: number;
  finance_days?: number;
  inspection_days?: number;
  conditions_json?: string;
  expires_at?: string;
  parent_offer_id?: number;
  version: number;
  created_at: string;
  updated_at: string;
}
```

### QLD Standard Conditions

```typescript
const defaultConditions = {
  finance: { enabled: true, days: 14 },
  buildingPest: { enabled: true, days: 7 },
  saleOfProperty: { enabled: false, days: 30 },
  valuation: { enabled: false, days: 14 },
  solicitorReview: { enabled: true, days: 5 }
};
```

---

## 9. API Endpoints

### Frontend API Routes (Next.js)

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/microsoft` | Initiate Microsoft OAuth |
| GET | `/api/auth/microsoft/callback` | Microsoft OAuth callback |
| GET | `/api/auth/session` | Get current session |
| GET | `/api/auth/token` | Generate JWT for C# API |
| POST | `/api/auth/signout` | Sign out user |
| GET | `/api/auth/csrf` | Get CSRF token |

#### Chat/Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get user conversations |
| GET | `/api/chat?conversationId=X` | Get messages in conversation |
| POST | `/api/chat` | Send message (CSRF protected) |
| GET | `/api/chat/unread` | Get unread message counts |

#### Push Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/push/subscribe` | Register push subscription (CSRF protected) |
| POST | `/api/push/send` | Send push notification (internal) |

#### Blob Storage (Secure Proxy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blob/upload` | Upload file to Azure Blob (CSRF protected) |
| POST | `/api/blob/signed-url` | Generate short-lived signed URL |

#### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/audit` | Create audit entry (CSRF protected) |
| POST | `/api/comparables` | Property comparison data (CSRF protected) |

### Backend API Routes (C# Web API)

#### User (`/api/user`)

| Method | Route | Auth | Access | Description |
|--------|-------|------|--------|-------------|
| POST | `/api/users/oauth` | Anonymous | Public | OAuth login/register |
| POST | `/api/user/` | Anonymous | Public | Register new user |
| GET | `/api/user/{id}` | Required | Own profile or admin | Get user by ID |
| GET | `/api/user/email/{email}` | Required | Own email or admin | Get user by email |
| GET | `/api/user/` | Required | Admin only | Get all users |
| PUT | `/api/user/` | Required | Own profile or admin | Update user |
| DELETE | `/api/user/{id}` | Required | Admin only | Delete user |

#### Property (`/api/property`)

| Method | Route | Auth | Access | Description |
|--------|-------|------|--------|-------------|
| GET | `/api/property/{id}` | Anonymous | Public | Get by ID |
| GET | `/api/property/` | Anonymous | Public | Get all published properties |
| GET | `/api/property/sellerusername/{email}` | Anonymous | Public | Get by seller email |
| GET | `/api/property/postsubbedbath/{postcode}/{beds}/{baths}` | Anonymous | Public | Search |
| GET | `/api/property/seller/{id}` | Required | Own listings or admin | Get by seller ID |
| GET | `/api/property/all/` | Required | Admin only | Get all properties |
| POST | `/api/property/` | Required | Authenticated | Create property |
| PUT | `/api/property/` | Required | Property seller or admin | Update property |
| DELETE | `/api/property/{id}` | Required | Property seller or admin | Delete property |

#### Conversations (`/api/conversation`)

| Method | Route | Auth | Access | Description |
|--------|-------|------|--------|-------------|
| GET | `/api/conversation/{id}` | Required | Participants only | Get by ID |
| GET | `/api/conversation/user/{id}` | Required | Own or admin | Get all for user |
| GET | `/api/conversation/unread/{userId}` | Required | Own or admin | Unread counts |
| POST | `/api/conversation/` | Required | Authenticated | Start conversation |

#### Messages (`/api/message`)

| Method | Route | Auth | Access | Description |
|--------|-------|------|--------|-------------|
| GET | `/api/message/conversation/{conversationId}` | Required | Participant | Get all in conversation |
| POST | `/api/message/` | Required | Participant | Send message |
| PUT | `/api/message/markread/{userId}/{conversationId}` | Required | Participant | Mark all read |

#### Offers (`/api/offer`)

| Method | Route | Auth | Access | Description |
|--------|-------|------|--------|-------------|
| GET | `/api/offer/{id}` | Required | Buyer or seller | Get by ID |
| GET | `/api/offer/property/{propertyId}` | Required | Property seller | Get all for property |
| GET | `/api/offer/buyer/{buyerId}` | Required | Own or admin | Get all for buyer |
| POST | `/api/offer/` | Required | Authenticated | Create offer |
| PUT | `/api/offer/` | Required | Buyer or seller | Update offer |
| POST | `/api/offer/{id}/counter` | Required | Buyer or seller | Counter-offer |

#### Push Subscriptions (`/api/push`)

| Method | Route | Auth | Access | Description |
|--------|-------|------|--------|-------------|
| POST | `/api/push/push_subscription` | Required | Authenticated | Web push subscribe |
| GET | `/api/push/push_subscription/email/{email}` | Required | Authenticated | Get subscriptions |
| DELETE | `/api/push/push_subscription/{id}` | Required | Authenticated | Delete subscription |
| POST | `/api/push/subscribe-native` | Required | Authenticated | iOS/Android subscribe |

---

## 10. Third-Party Integrations

### Google OAuth 2.0

```
Client ID: GOOGLE_CLIENT_ID
Scopes: openid email profile
Callback: /api/auth/google/callback
```

### Microsoft Azure AD

```
Client ID: AZURE_AD_CLIENT_ID
Tenant ID: AZURE_AD_TENANT_ID
Scopes: openid email profile User.Read
Callback: /api/auth/microsoft/callback
```

### Google Maps API

```
API Key: NEXT_PUBLIC_GOOGLE_MAP_API
Features: Maps, Geocoding, Places
```

### Azure Blob Storage

```
Account: buyselstore
Container: photosdocs
Access: SAS Token based
Base URL: https://buyselstore.blob.core.windows.net
```

### Web Push (VAPID)

```
Public Key: NEXT_PUBLIC_VAPID_PUBLIC_KEY
Private Key: VAPID_PRIVATE_KEY
Contact: VAPID_EMAIL
```

### Apple APNS (iOS Push)

```
Key: P8 key in pushsubscriptionEP.cs
KeyId: Hardcoded
TeamId: Hardcoded
```

---

## 11. Environment Configuration

### Required Environment Variables (Frontend)

```env
# Authentication
JWT_SECRET=<shared-secret-with-csharp-backend>
SESSION_SECRET=<32-character-random-string>
NEXTAUTH_URL=https://your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# Microsoft Azure AD
AZURE_AD_CLIENT_ID=<azure-ad-client-id>
AZURE_AD_CLIENT_SECRET=<azure-ad-client-secret>
AZURE_AD_TENANT_ID=<azure-ad-tenant-id>

# Backend API
NEXT_PUBLIC_API_URL=https://buysel.azurewebsites.net

# Azure Blob Storage
NEXT_PUBLIC_AZUREBLOB_CONTAINER=photosdocs
NEXT_PUBLIC_AZUREBLOB_SASURL_BASE=https://buyselstore.blob.core.windows.net
NEXT_PUBLIC_AZUREBLOB_SASTOKEN=<sas-token>

# Google Maps
NEXT_PUBLIC_GOOGLE_MAP_API=<google-maps-api-key>

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_EMAIL=mailto:admin@buysel.com.au
```

### Environment Files

- `.env.example` - Template with all required variables (committed)
- `.env.local` - Local development (not committed)
- `.env.production` - Production values (committed without secrets)
- GitHub Secrets - CI/CD deployment secrets

**Important:** Use `.env.example` as a template. Never commit actual secrets to `.env.local` or `.env.production`.

---

## 12. Build & Deployment

### Local Development

```bash
# Frontend
cd realestate
npm install
npm run dev
# Open http://localhost:3000

# Backend
cd buyselwebapi-main
dotnet run
# API on http://localhost:5005
# Swagger on http://localhost:5005/swagger
```

### Production Build (Frontend)

```bash
# Update service worker version
node scripts/update-sw-version.js

# Build the application
npm run build

# Restore service worker version
node scripts/restore-sw-version.js
```

### Production Build (Backend)

```bash
dotnet publish -c Release -r linux-x64
```

### Azure Deployment

| Component | Service | URL |
|-----------|---------|-----|
| Frontend | Azure Web App | buysel-webapp.azurewebsites.net |
| Backend | Azure App Service | buysel.azurewebsites.net |
| Database | Azure SQL | buyselserver.database.windows.net |
| Storage | Azure Blob | buyselstore.blob.core.windows.net |

### CORS Configuration (Backend)

Allowed origins:
- `http://localhost:3000` (local dev)
- `https://buysel-webapp.azurewebsites.net` (production)

---

## 13. Key Features

### Property Search

- **List View:** Card-based property listings
- **Map View:** Google Maps integration with markers
- **Filters:** Price range, bedrooms, bathrooms, property type
- **Favorites:** Save properties to favorites list
- **Geocoding:** Automatic lat/lon from address via Google Maps API

### Messaging System

- Real-time chat between buyers and sellers
- Conversation threads per property
- Push notifications for new messages (Web + iOS)
- Message read receipts
- File attachments via Azure Blob

### Offer Management

- Create offers with QLD standard conditions
- Counter-offer functionality
- Offer expiration tracking
- Version history via `parent_offer_id`
- Status tracking (pending, accepted, rejected, countered, withdrawn, expired)
- Conditions: finance, building/pest, sale of property, valuation, solicitor review

### Push Notifications

- **Web Push:** VAPID-based Web Push API
- **iOS:** Apple APNS via dotAPNS library
- **Android:** Device token based
- Service Worker integration
- Notification badges
- Background sync

### Document Management

- Upload to Azure Blob Storage
- Document verification workflow
- Public/private visibility toggle
- Types: Building inspection, Pest inspection, Title search

### Comparables

- Web scraping from trusted real estate sites
- Supported sites: homely.com.au, domain.com.au, realestate.com.au
- Search by suburb/postcode
- Property data extraction (price, beds, baths, land size)

---

## 14. Code Structure

### Authentication Context

```typescript
// lib/auth/auth-context.tsx
const AuthProvider = ({ children }) => {
  // Session management via iron-session
  // JWT token generation
  // User state
};

const useAuth = () => useContext(AuthContext);
```

### API Service Pattern

```typescript
// services/api.ts
const api = {
  getProperties: async () => { ... },
  createProperty: async (data) => { ... },
  getConversations: async () => { ... },
  sendMessage: async (data) => { ... },
};
```

### Data Fetching with React Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['properties'],
  queryFn: api.getProperties,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Server-side API Calls

```typescript
// lib/server-api.ts
export async function serverFetchWithAuth(url: string, options?: RequestInit) {
  const session = await getSession();
  const token = await generateJWT(session.user);
  // Attach Authorization header
}
```

---

## 15. Known Issues & TODOs

### Technical Debt

- [ ] Connection string hardcoded in backend Program.cs
- [ ] JWT secret hardcoded in backend
- [ ] Google Maps API key hardcoded in propertyEP.cs
- [ ] APNS credentials hardcoded in pushsubscriptionEP.cs
- [ ] No EF migrations tracked in repo
- [ ] Large component files (ChatModal, AddPropertyDialog)
- [ ] ESLint/TypeScript warnings ignored in build
- [x] ~~Azure Blob SAS token exposed client-side~~ (Fixed: Server-side proxy added)
- [x] ~~No rate limiting on API routes~~ (Fixed: middleware.ts added)
- [x] ~~No security headers~~ (Fixed: next.config.ts headers)
- [x] ~~Console logging of sensitive data~~ (Fixed: PII removed from logs)

### Future Enhancements

- [ ] WebSocket real-time messaging (currently polling)
- [ ] Enhanced search with Elasticsearch
- [ ] Mobile app (React Native)
- [ ] Payment integration for premium listings
- [ ] Move secrets to Azure Key Vault

---

## 16. Maintenance & Operations

### Monitoring

- Azure Application Insights (backend)
- Browser DevTools (frontend)
- GitHub Actions logs (deployments)

### Log Locations

- **Frontend:** Browser console, Next.js server logs
- **Backend:** Azure App Service logs
- **Database:** Azure SQL query logs

### Common Operations

#### Rotate VAPID Keys

```bash
npx web-push generate-vapid-keys
# Update .env and Azure App Settings
```

#### Update SAS Token

1. Generate new SAS token in Azure Portal
2. Update `NEXT_PUBLIC_AZUREBLOB_SASTOKEN`
3. Redeploy frontend

### Security Checklist

- [ ] JWT_SECRET matches frontend and backend
- [ ] SAS tokens not expired
- [ ] OAuth credentials valid
- [ ] HTTPS enforced
- [ ] Session cookies secure
- [ ] CSRF tokens working

### Backup & Recovery

- **Database:** Azure SQL automatic backups
- **Blob Storage:** Azure Blob versioning enabled
- **Code:** GitHub repository

---

## Contact & Resources

### Documentation

- `docs/AUTH_IMPLEMENTATION.md` - Authentication guide
- `docs/DEPLOYMENT_GUIDE.md` - Deployment steps
- `docs/IMPLEMENTATION_SUMMARY.md` - Chat system docs

### Azure Resources

| Resource | Type | Resource Group |
|----------|------|----------------|
| buysel-webapp | Web App | buysel-rg |
| buysel | App Service | buysel-rg |
| buyselstore | Storage Account | buysel-rg |
| buysel-db | SQL Database | buysel-rg |

### External Links

- [Azure Portal](https://portal.azure.com)
- [GitHub Repository](https://github.com/your-org/realestate)
- [Google Cloud Console](https://console.cloud.google.com)
- [Facebook Developers](https://developers.facebook.com)

---

*Document last updated: March 2026*
*Version: 0.3.0*

---

## Changelog

### v0.3.0 (March 2026)
- Added security headers section (HSTS, CSP, X-Frame-Options)
- Added rate limiting middleware documentation
- Added secure fetch utility documentation
- Added API response validation schemas
- Added blob upload proxy endpoints
- Updated lib/ directory structure
- Marked resolved technical debt items
