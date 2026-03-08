/**
 * @fileoverview JWT token generation and verification for frontend-to-backend auth.
 *
 * Authentication Flow:
 * 1. User authenticates via Google OAuth (NextAuth.js handles OAuth flow)
 * 2. NextAuth stores user session in iron-session (encrypted cookie)
 * 3. When calling C# backend, this module generates a JWT from session data
 * 4. C# backend validates JWT using shared secret (symmetric HS256)
 *
 * IMPORTANT: JWT_SECRET must match between frontend (.env.local) and backend (appsettings.json)
 *
 * @module lib/auth/jwt
 */
import jwt from 'jsonwebtoken'

/** JWT signing secret - must match C# backend's JWT_SECRET */
const JWT_SECRET = process.env.JWT_SECRET!
/** JWT issuer claim - must match C# backend's JWT_ISSUER */
const JWT_ISSUER = 'BuySell'
/** JWT audience claim - must match C# backend's JWT_AUDIENCE */
const JWT_AUDIENCE = 'CharterTowers'

/**
 * JWT payload structure for user authentication.
 * These claims are extracted by the C# backend from ClaimsPrincipal.
 */
export interface JWTPayload {
  /** User's database ID (from User table) */
  sub: string
  /** User's email address (unique identifier) */
  email: string
  /** User's display name */
  name: string
  /** User role: 'admin', 'seller', 'buyer' (optional) */
  role?: string
  /** OAuth provider: 'google', 'credentials', etc. */
  provider: string
}

/**
 * Creates a signed JWT token for authenticating with the C# backend.
 *
 * Note: Claims are ordered specifically for .NET's JwtSecurityTokenHandler
 * compatibility. The iss (issuer) claim must come first.
 *
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string (valid for 1 hour)
 *
 * @example
 * const token = await signJWT({
 *   sub: user.id,
 *   email: user.email,
 *   name: user.name,
 *   provider: 'google'
 * })
 * headers['Authorization'] = `Bearer ${token}`
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  // Manually construct payload with ALL claims to ensure correct ordering
  // .NET's JwtSecurityTokenHandler may have issues with claim order
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    iss: JWT_ISSUER,          // pos 0 - issuer FIRST (required by .NET)
    sub: payload.sub,          // pos 1 - subject (user ID)
    aud: JWT_AUDIENCE,         // pos 2 - audience
    exp: now + 3600,           // pos 3 - expiration (1 hour)
    iat: now,                  // pos 4 - issued at
    email: payload.email,      // pos 5 - custom claim
    name: payload.name,        // pos 6 - custom claim
    provider: payload.provider // pos 7 - custom claim
  }

  // Sign without using options to preserve exact payload order
  return jwt.sign(fullPayload, JWT_SECRET, { algorithm: 'HS256' })
}

/**
 * Verifies and decodes a JWT token.
 * Used for validating tokens in API routes.
 *
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid, null if invalid/expired
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return decoded as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}
