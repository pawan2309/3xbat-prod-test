import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const response = await fetch('http://localhost:4000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    const data = await response.json()

    // Clear the session cookie
    const nextResponse = NextResponse.json(data)
    nextResponse.cookies.delete('session')
    
    return nextResponse
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
