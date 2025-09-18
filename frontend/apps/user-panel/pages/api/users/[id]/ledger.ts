import { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../../../lib/apiProxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  return proxyToBackend(req, res, `/api/users/${id}/ledger`);
}
