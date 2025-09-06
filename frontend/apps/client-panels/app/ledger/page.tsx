'use client'

import { useRouter } from 'next/navigation'

export default function LedgerPage() {
  const router = useRouter()
  
  return (
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
                <div className="text-2xl font-bold text-green-800">₹25,000</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm font-medium">Total Withdrawals</div>
                <div className="text-2xl font-bold text-red-800">₹5,000</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-600 text-sm font-medium">Net Balance</div>
                <div className="text-2xl font-bold text-blue-800">₹20,000</div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { id: 1, type: 'Deposit', amount: 10000, date: '2024-01-15', status: 'Completed', description: 'Bank Transfer' },
                  { id: 2, type: 'Bet', amount: -500, date: '2024-01-14', status: 'Completed', description: 'Cricket Match - India vs Australia' },
                  { id: 3, type: 'Win', amount: 1200, date: '2024-01-14', status: 'Completed', description: 'Cricket Match - India vs Australia' },
                  { id: 4, type: 'Deposit', amount: 5000, date: '2024-01-13', status: 'Completed', description: 'UPI Transfer' },
                  { id: 5, type: 'Bet', amount: -200, date: '2024-01-13', status: 'Completed', description: 'Casino - Teen Patti' },
                  { id: 6, type: 'Withdrawal', amount: -2000, date: '2024-01-12', status: 'Pending', description: 'Bank Transfer' }
                ].map((transaction) => (
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
  )
}