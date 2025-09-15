import { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../../lib/apiProxy';

export const runtime = 'nodejs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Proxy all requests to backend
  return proxyToBackend(req, res, `/api/users/${req.query.id}`);
}