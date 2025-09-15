// Helper function to proxy API requests to backend
import { NextApiRequest, NextApiResponse } from 'next';

export interface ProxyOptions {
  method?: string;
  body?: any;
  query?: Record<string, string>;
}

export async function proxyToBackend(
  req: NextApiRequest,
  res: NextApiResponse,
  endpoint: string,
  options: ProxyOptions = {}
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const method = options.method || req.method || 'GET';
    
    // Build query string from options.query or req.query
    const queryParams = new URLSearchParams();
    const query = options.query || req.query;
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `${backendUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': req.headers.cookie || '', // Forward cookies for authentication
    };
    
    // Copy relevant headers from the original request
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    if (req.headers['user-agent']) {
      headers['User-Agent'] = req.headers['user-agent'];
    }
    
    // Prepare request body
    let body: string | undefined;
    if (options.body) {
      body = JSON.stringify(options.body);
    } else if (req.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      body = JSON.stringify(req.body);
    }
    
    console.log(`🔄 Proxying ${method} ${url} to backend`);
    
    // Make request to backend
    const backendResponse = await fetch(url, {
      method,
      headers,
      body,
    });
    
    // Get response data
    const responseData = await backendResponse.json();
    
    // Forward the response
    return res.status(backendResponse.status).json(responseData);
    
  } catch (error) {
    console.error(`❌ Error proxying to backend ${endpoint}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to communicate with backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper for GET requests
export async function proxyGet(req: NextApiRequest, res: NextApiResponse, endpoint: string) {
  return proxyToBackend(req, res, endpoint, { method: 'GET' });
}

// Helper for POST requests
export async function proxyPost(req: NextApiRequest, res: NextApiResponse, endpoint: string) {
  return proxyToBackend(req, res, endpoint, { method: 'POST' });
}

// Helper for PUT requests
export async function proxyPut(req: NextApiRequest, res: NextApiResponse, endpoint: string) {
  return proxyToBackend(req, res, endpoint, { method: 'PUT' });
}

// Helper for DELETE requests
export async function proxyDelete(req: NextApiRequest, res: NextApiResponse, endpoint: string) {
  return proxyToBackend(req, res, endpoint, { method: 'DELETE' });
}
