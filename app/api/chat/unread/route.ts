import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { serverFetchWithAuth } from '@/lib/server-api'
import { API_ENDPOINTS } from '@/lib/config'

export async function GET(req: NextRequest) {
  const session = await getSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's numeric ID from email
    const userEmailUrl = API_ENDPOINTS.USER_BY_EMAIL(session.user.email!)
    const userResponse = await serverFetchWithAuth(userEmailUrl)

    if (!userResponse.ok) {
      // User hasn't completed profile yet - no messages possible
      return NextResponse.json({ conversations: [], totalUnread: 0 })
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Get unread conversations for the user
    const unreadConvUrl = API_ENDPOINTS.CONVERSATION_UNREAD(userId)
    console.log('Fetching unread conversations from:', unreadConvUrl)
    const unreadConvResponse = await serverFetchWithAuth(unreadConvUrl)
    
    if (!unreadConvResponse.ok) {
      console.log('No unread conversations found')
      return NextResponse.json({ conversations: [], totalUnread: 0 })
    }

    const unreadConversations = await unreadConvResponse.json()
    console.log('Found unread conversations:', unreadConversations)
    
    // Process conversations with unread messages
    const processedConversations = []
    let totalUnread = 0
    
    for (const conv of unreadConversations) {
      if (conv.unread > 0) {
        // Get unread messages for this specific conversation
        const unreadMsgUrl = API_ENDPOINTS.MESSAGE_UNREAD_BY_CONV(userId, conv.id)
        console.log('Fetching unread messages from:', unreadMsgUrl)
        const unreadMsgResponse = await serverFetchWithAuth(unreadMsgUrl)

        let messages = []
        if (unreadMsgResponse.ok) {
          messages = await unreadMsgResponse.json()
          console.log(`Found ${messages.length} unread messages for conversation ${conv.id}`)
        }

        // Get the last message
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

        if (lastMessage) {
          // Get property details
          const propResponse = await serverFetchWithAuth(API_ENDPOINTS.PROPERTY_BY_ID(conv.property_id))
          const property = propResponse.ok ? await propResponse.json() : { title: 'Property' }

          // Get other user's name
          const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id
          const otherUserResponse = await serverFetchWithAuth(API_ENDPOINTS.USER_BY_ID(otherUserId))
          const otherUser = otherUserResponse.ok
            ? await otherUserResponse.json()
            : { firstname: 'User', lastname: '' }
          
          processedConversations.push({
            conversationId: conv.id.toString(),
            propertyId: conv.property_id,
            propertyTitle: property.title,
            otherUserName: `${otherUser.firstname} ${otherUser.lastname}`,
            lastMessage: lastMessage.content,
            unreadCount: conv.unread,
            timestamp: lastMessage.created_at
          })
          
          totalUnread += conv.unread
        }
      }
    }

    // Sort by most recent first
    processedConversations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({ 
      conversations: processedConversations, 
      totalUnread 
    })
  } catch (error) {
    console.error('Error fetching unread messages:', error)
    return NextResponse.json({ conversations: [], totalUnread: 0 })
  }
}