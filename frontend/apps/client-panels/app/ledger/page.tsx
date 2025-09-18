'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ProtectedLayout from '@/components/ProtectedLayout'

interface Transaction {
  id: number
  type: string
  amount: number
  date: string
  status: string
  description: string
}

interface LedgerSummary {
  totalDeposits: number
  totalWithdrawals: number
  netBalance: number
}

export default function LedgerPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<LedgerSummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    netBalance: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch ledger data from API
  useEffect(() => {
    const fetchLedgerData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        // const response = await fetch('/api/ledger')
        // const data = await response.json()
        
        // For now, show empty state
        setTransactions([])
        setSummary({
          totalDeposits: 0,
          totalWithdrawals: 0,
          netBalance: 0
        })
      } catch (err) {
        setError('Failed to load ledger data')
        console.error('Error fetching ledger data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLedgerData()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-white">
          <div className="w-full">
            <div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-red-600 text-white font-bold text-md p-2 border border-red-800 hover:bg-red-700 transition-colors"
              >
                BACK TO MENU
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading ledger data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-white">
          <div className="w-full">
            <div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-red-600 text-white font-bold text-md p-2 border border-red-800 hover:bg-red-700 transition-colors"
              >
                BACK TO MENU
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Ledger</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white">
        <div className="w-full">
          {/* Back to Menu Button */}
          <div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-red-600 text-white font-bold text-md p-2 border border-red-800 hover:bg-red-700 transition-colors"
            >
              BACK TO MENU
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">My Ledger</h1>
            
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              {/* Ledger Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium">Total Deposits</div>
                  <div className="text-2xl font-bold text-green-800">₹{summary.totalDeposits.toLocaleString()}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 text-sm font-medium">Total Withdrawals</div>
                  <div className="text-2xl font-bold text-red-800">₹{summary.totalWithdrawals.toLocaleString()}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 text-sm font-medium">Net Balance</div>
                  <div className="text-2xl font-bold text-blue-800">₹{summary.netBalance.toLocaleString()}</div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">No transactions found</div>
                    <p className="text-gray-400">Your transaction history will appear here once you start betting.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'Deposit' ? 'bg-green-500' :
                            transaction.type === 'Withdrawal' ? 'bg-red-500' :
                            transaction.type === 'Bet' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-800">{transaction.description}</div>
                            <div className="text-sm text-gray-500">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                          </div>
                          <div className={`text-xs ${
                            transaction.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Download Statement
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Filter Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}