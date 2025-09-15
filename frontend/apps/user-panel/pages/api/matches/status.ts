import { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../lib/apiProxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Proxy all requests to backend
  return proxyToBackend(req, res, '/api/matches/status');
}
