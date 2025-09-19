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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://user.3xbat.com';
    const method = options.method || req.method || 'GET';
    
    console.log('🔄 API Proxy: Backend URL:', backendUrl);
    console.log('🔄 API Proxy: Endpoint:', endpoint);
    
    // Test backend connectivity first
    try {
      const healthCheck = await fetch(`${backendUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      if (!healthCheck.ok) {
        console.warn('⚠️ Backend health check failed:', healthCheck.status);
      } else {
        console.log('✅ Backend health check passed');
      }
    } catch (healthError) {
      console.error('❌ Backend health check failed:', healthError);
      return res.status(503).json({
        success: false,
        message: 'Backend service unavailable',
        error: 'Backend health check failed',
        details: {
          backendUrl,
          healthError: healthError instanceof Error ? healthError.message : 'Unknown health error'
        }
      });
    }
    
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
    
    console.log('🔄 API Proxy: Forwarding cookies:', req.headers.cookie);
    console.log('🔄 API Proxy: Target URL:', url);
    
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
    
    // Make request to backend with timeout and better error handling
    let backendResponse;
    try {
      backendResponse = await fetch(url, {
        method,
        headers,
        body,
        timeout: 10000, // 10 second timeout
      });
      
      // For session check endpoints, 401 is a normal response (no valid session)
      // Don't treat it as an error, just forward the response
      if (!backendResponse.ok && !(endpoint.includes('session-check') && backendResponse.status === 401)) {
        console.error(`❌ Backend responded with status: ${backendResponse.status} ${backendResponse.statusText}`);
        throw new Error(`Backend responded with status: ${backendResponse.status}`);
      }
    } catch (fetchError) {
      console.error(`❌ Fetch error for ${url}:`, fetchError);
      return res.status(500).json({
        success: false,
        message: 'Failed to communicate with backend',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        details: {
          url,
          method,
          errorType: fetchError instanceof Error ? fetchError.constructor.name : 'Unknown'
        }
      });
    }
    
    // Get response data
    let responseData;
    try {
      responseData = await backendResponse.json();
    } catch (jsonError) {
      console.error(`❌ JSON parse error for ${url}:`, jsonError);
      return res.status(500).json({
        success: false,
        message: 'Invalid JSON response from backend',
        error: jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'
      });
    }
    
    // Forward Set-Cookie headers from backend to frontend
    const setCookieHeaders = backendResponse.headers.get('set-cookie');
    if (setCookieHeaders) {
      console.log('🍪 Forwarding Set-Cookie header:', setCookieHeaders);
      res.setHeader('Set-Cookie', setCookieHeaders);
    }
    
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
