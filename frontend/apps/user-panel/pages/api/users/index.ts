import { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'nodejs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List users with optional role, parentId, and isActive filtering
    try {
      const { role, parentId, isActive, excludeInactiveParents } = req.query;
      
      // Build query parameters for backend API
      const queryParams = new URLSearchParams();
      if (role && typeof role === 'string') {
        queryParams.append('role', role);
      }
      if (parentId && typeof parentId === 'string') {
        queryParams.append('parentId', parentId);
      }
      if (isActive !== undefined) {
        queryParams.append('isActive', String(isActive));
      }
      if (excludeInactiveParents === 'true') {
        queryParams.append('excludeInactiveParents', 'true');
      }
      
      // Forward request to backend API
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const backendResponse = await fetch(`${backendUrl}/api/users?${queryParams.toString()}`, {
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
      console.error('Error fetching users from backend:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch users', error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    // Create a new user
    try {
      console.log('Creating user with body:', req.body);
      
      // Forward request to backend API
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const backendResponse = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie || '', // Forward cookies for authentication
        },
        body: JSON.stringify(req.body),
      });
      
      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        return res.status(backendResponse.status).json(errorData);
      }
      
      const data = await backendResponse.json();
      return res.status(201).json(data);
    } catch (error) {
      console.error('Error creating user via backend:', error);
      return res.status(500).json({ success: false, message: 'Failed to create user', error: (error as Error).message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

export default handler; 