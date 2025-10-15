// Temporarily disabled NextAuth middleware for Azure Static Web Apps compatibility
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all requests (no authentication required temporarily)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/seller/:path*',
    '/admin/:path*',
  ],
}
