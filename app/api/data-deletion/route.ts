import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Zod schema for data deletion validation
const dataDeletionSchema = z.object({
  user_id: z.union([z.string().min(1), z.number().int().positive()]).optional(),
  userId: z.union([z.string().min(1), z.number().int().positive()]).optional()
}).refine(data => data.user_id || data.userId, {
  message: 'user_id or userId is required'
})

export async function POST(req: NextRequest) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with Zod
  const parseResult = dataDeletionSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const userId = parseResult.data.user_id || parseResult.data.userId

    const confirmationCode = `${userId}_${Date.now()}`

    console.log(`Data deletion request received for user: ${userId}`)
    console.log(`Confirmation code: ${confirmationCode}`)

    return NextResponse.json({
      url: `${process.env.NEXTAUTH_URL}/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    })
  } catch (error) {
    console.error('Data deletion request error:', error)
    return NextResponse.json(
      { error: 'Failed to process data deletion request' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  return NextResponse.json({
    message: 'Data deletion endpoint',
    note: 'POST request required with user_id',
    confirmation_code: code || null
  })
}
