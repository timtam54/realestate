import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCsrf } from '@/lib/auth/csrf'
import { API_ENDPOINTS } from '@/lib/config'

// Zod schema for audit input validation
const auditSchema = z.object({
  action: z.string().min(1).max(200),
  page: z.string().min(1).max(200),
  username: z.string().max(200).optional(), // Can be email or 'anonymous'
  propertyid: z.number().int().optional(),
  ipaddress: z.string().max(50).optional()
})

export async function POST(request: NextRequest) {
  // Validate CSRF token
  const csrfResult = await requireCsrf(request)
  if (!csrfResult.valid) {
    return NextResponse.json({ error: csrfResult.error }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with Zod
  const parseResult = auditSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  // Get real IP from request headers (set by proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown'

  // Override client IP with server-detected IP
  const auditData = {
    ...parseResult.data,
    ipaddress: realIp,
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUDIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Audit log failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
