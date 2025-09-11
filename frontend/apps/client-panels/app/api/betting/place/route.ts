import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketName, odds, stake } = body;

    // Validate required fields
    if (!userId || !marketName || !odds || !stake) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userId, marketName, odds, stake'
      }, { status: 400 });
    }

    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/betting/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        marketName,
        odds: parseFloat(odds),
        stake: parseFloat(stake)
      })
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: response.status });
    }

  } catch (error) {
    console.error('Error in betting API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
