import { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../../lib/apiProxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Redirect to unified-logout for consistency
  return proxyToBackend(req, res, '/api/auth/unified-logout');
}
