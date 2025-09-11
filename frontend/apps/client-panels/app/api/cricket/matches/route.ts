import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const response = await fetch('http://localhost:4000/api/cricket/matches', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    const data = await response.json()
    
    // Forward the status code from backend
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Cricket matches API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

