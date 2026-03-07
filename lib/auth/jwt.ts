import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_ISSUER = 'BuySell'
const JWT_AUDIENCE = 'CharterTowers'

export interface JWTPayload {
  sub: string // user id
  email: string
  name: string
  role?: string
  provider: string
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  // Manually construct payload with ALL claims to ensure correct ordering
  // .NET's JwtSecurityTokenHandler may have issues with claim order
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    iss: JWT_ISSUER,          // pos 0 - issuer FIRST
    sub: payload.sub,          // pos 1
    aud: JWT_AUDIENCE,         // pos 2 - audience
    exp: now + 3600,           // pos 3 - expiration
    iat: now,                  // pos 4
    email: payload.email,      // pos 5
    name: payload.name,        // pos 6
    provider: payload.provider // pos 7
  }

  // Sign without using options to preserve exact payload order
  return jwt.sign(fullPayload, JWT_SECRET, { algorithm: 'HS256' })
}

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
