import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { serverFetchWithAuth } from '@/lib/server-api'
import { z } from 'zod'
import { requireCsrf } from '@/lib/auth/csrf'
import { API_ENDPOINTS } from '@/lib/config'

// Zod schemas for input validation
const chatPostSchema = z.object({
  propertyId: z.number().int().positive(),
  sellerId: z.number().int().positive(),
  content: z.string().min(1).max(5000),
  conversationId: z.string().optional()
})

const chatGetParamsSchema = z.object({
  conversationId: z.string().optional(),
  propertyId: z.string().regex(/^\d+$/).optional(),
  sellerId: z.string().regex(/^\d+$/).optional()
})

export async function GET(req: NextRequest) {
  const session = await getSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')
  const propertyId = searchParams.get('propertyId')
  const sellerId = searchParams.get('sellerId')
  
  try {
    if (conversationId) {
      // Get messages for a specific conversation
      const messageUrl = API_ENDPOINTS.MESSAGE_BY_CONVERSATION(conversationId)
      const response = await serverFetchWithAuth(messageUrl)
      const messages = await response.json()
      return NextResponse.json(messages)
    } else {
      // Get all conversations for the user
      // First, we need to get the user's numeric ID from their email
      const userEmailUrl = API_ENDPOINTS.USER_BY_EMAIL(session.user.email!)
      const userResponse = await serverFetchWithAuth(userEmailUrl)
      if (!userResponse.ok) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      const userData = await userResponse.json()
      const userId = userData.id

      const url = API_ENDPOINTS.CONVERSATION_BY_USER(userId)

      const response = await serverFetchWithAuth(url)

      // Check if response is ok
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: response.status })
      }

      // Check if response has content
      const text = await response.text()
      if (!text) {
        return NextResponse.json([])
      }

      try {
        let conversations = JSON.parse(text)

        // Filter by property ID if specified
        if (propertyId) {
          conversations = conversations.filter((conv: any) =>
            conv.property_id === parseInt(propertyId)
          )
        }

        return NextResponse.json(conversations)
      } catch {
        return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Chat API error:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json({ error: 'Failed to fetch chat data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Validate CSRF token
  const csrfResult = await requireCsrf(req)
  if (!csrfResult.valid) {
    return NextResponse.json({ error: csrfResult.error }, { status: 403 })
  }

  const session = await getSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with Zod
  const parseResult = chatPostSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const { propertyId, sellerId, content, conversationId } = parseResult.data

  try {
    // Get user's numeric ID from email
    const userEmailUrl = API_ENDPOINTS.USER_BY_EMAIL(session.user.email!)
    const userResponse = await serverFetchWithAuth(userEmailUrl)
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const userData = await userResponse.json()
    const userId = userData.id

    let convId = conversationId
    let buyerId: number
    let actualSellerId: number

    // Create conversation if it doesn't exist
    if (!convId) {
      // Check if current user is the seller
      if (userId === sellerId) {
        return NextResponse.json({ error: 'Seller cannot initiate chat with themselves' }, { status: 400 })
      }

      // Current user is the buyer
      buyerId = userId
      actualSellerId = sellerId
      const convUrl = API_ENDPOINTS.CONVERSATION

      const convResponse = await serverFetchWithAuth(convUrl, {
        method: 'POST',
        body: JSON.stringify({
          id: 0,
          property_id: propertyId,
          buyer_id: userId,
          seller_id: sellerId
        })
      })

      if (!convResponse.ok) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      const responseText = await convResponse.text()

      if (!responseText) {
        return NextResponse.json({ error: 'Empty response from conversation API' }, { status: 500 })
      }

      try {
        const newConversation = JSON.parse(responseText)
        convId = newConversation.id.toString()
        buyerId = newConversation.buyer_id
        actualSellerId = newConversation.seller_id
      } catch {
        return NextResponse.json({ error: 'Invalid conversation response' }, { status: 500 })
      }
    } else {
      // If using existing conversation, get buyer and seller IDs
      const convDetailUrl = API_ENDPOINTS.CONVERSATION_BY_ID(convId)
      let convDetailResponse
      try {
        convDetailResponse = await serverFetchWithAuth(convDetailUrl)
      } catch {
        return NextResponse.json({ error: 'Network error fetching conversation details' }, { status: 500 })
      }
      if (convDetailResponse.ok) {
        const convDetail = await convDetailResponse.json()
        buyerId = convDetail.buyer_id
        actualSellerId = convDetail.seller_id
      } else {
        return NextResponse.json({ error: 'Failed to fetch conversation details' }, { status: 500 })
      }
    }

    // Create message
    const messageUrl = API_ENDPOINTS.MESSAGE
    const conversationIdNum = convId ? parseInt(convId) : 0
    const messageResponse = await serverFetchWithAuth(messageUrl, {
      method: 'POST',
      body: JSON.stringify({
        id: 0,
        conversation_id: conversationIdNum,
        sender_id: userId,
        content: content
      })
    })

    const message = await messageResponse.json()

    // Validate we have buyer and seller IDs
    if (!buyerId || !actualSellerId) {
      return NextResponse.json({ ...message, conversationId: convId })
    }

    // Determine recipient ID (if sender is buyer, recipient is seller and vice versa)
    const recipientId = (userId === actualSellerId) ? buyerId : actualSellerId

    // Get sender info for notification
    const senderResponse = await serverFetchWithAuth(API_ENDPOINTS.USER_BY_ID(userId))
    const senderData = await senderResponse.json()

    // Verify property exists (response validates property is accessible)
    const propertyResponse = await serverFetchWithAuth(API_ENDPOINTS.PROPERTY_BY_ID(propertyId))
    if (!propertyResponse.ok) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    try {
      // Send push notification via our API
      const pushResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: recipientId,
          payload: {
            title: `New message from ${senderData.firstname} ${senderData.lastname}`,
            body: content.substring(0, 100),
            url: `/buyer/messages?conversationId=${convId}`,
            conversationId: convId,
            propertyId: propertyId
          }
        })
      })

      if (!pushResponse.ok) {
        // Log minimally - no sensitive data
        console.error('Push notification failed')
      }
    } catch {
      // Don't fail the whole request if push fails
    }

    return NextResponse.json({ ...message, conversationId: convId })
  } catch (error) {
    console.error('Message send error:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}