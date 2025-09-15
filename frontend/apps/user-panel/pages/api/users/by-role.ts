import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { role } = req.query;

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ success: false, message: 'Role parameter is required' });
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const backendResponse = await fetch(`${backendUrl}/api/users/by-role?role=${encodeURIComponent(role)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || '', // Forward cookies for authentication
      },
    });
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return res.status(backendResponse.status).json(errorData);
    }
    
    const data = await backendResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching users by role from backend:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users', 
      error: (error as Error).message 
    });
  }
} 