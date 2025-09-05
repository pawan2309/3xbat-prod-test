import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    // TEMPORARY: BYPASS DATABASE VALIDATION FOR TESTING
    // const ledger = await prisma.ledger.findMany({
    //   where: {
    //     userId: id,
    //     type: {
    //       in: [
    //         'DEPOSIT',
    //         'WITHDRAWAL',
    //         'LIMIT_UPDATE',
    //         'ADJUSTMENT',
    //         'SETTLEMENT',
    //       ],
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    // MOCK LEDGER DATA FOR TESTING - Remove this in production!
    const ledger = [
      {
        id: 'mock-ledger-1',
        userId: id,
        collection: 'LIMIT_UPDATE',
        debit: 0,
        credit: 100000,
        balanceAfter: 100000,
        type: 'ADJUSTMENT',
        remark: 'Initial credit limit allocation',
        createdAt: new Date().toISOString(),
        transactionType: 'ADJUSTMENT'
      },
      {
        id: 'mock-ledger-2',
        userId: id,
        collection: 'BET',
        debit: 1000,
        credit: 0,
        balanceAfter: 99000,
        type: 'BET',
        remark: 'Test bet placed',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        transactionType: 'BET'
      }
    ];

    return res.status(200).json({ success: true, ledger });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 