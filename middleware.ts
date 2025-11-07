import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Don't intercept these paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/sw-cleanup') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Check if the user needs service worker cleanup
  // We'll use a cookie to track if cleanup has been done
  const cleanupDone = request.cookies.get('sw-cleanup-done')

  if (!cleanupDone) {
    // Redirect to cleanup page
    const url = request.nextUrl.clone()
    url.pathname = '/sw-cleanup'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
