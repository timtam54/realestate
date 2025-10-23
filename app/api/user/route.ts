import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch user data from Azure API
    const userEmailUrl = `https://buysel.azurewebsites.net/api/user/email/${encodeURIComponent(session.user.email)}`
    console.log('🔵 User API: Fetching user by email from:', userEmailUrl)
    
    const userResponse = await fetch(userEmailUrl)
    
    if (!userResponse.ok) {
      console.error('Failed to fetch user by email:', session.user.email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const userData = await userResponse.json()
    console.log('🔵 User API: User data retrieved:', userData)
    
    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}