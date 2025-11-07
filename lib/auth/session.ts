import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  user?: {
    id: string
    email: string
    name: string
    image?: string
    provider: 'google' | 'microsoft' | 'facebook'
    role?: string
  }
  isLoggedIn: boolean
}

// Get session configuration from environment
export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'buysel_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session.user || null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}
