'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ProtectedRoute from '@/components/ProtectedRoute'

// Dynamically import Header to prevent SSR
const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
  loading: () => <div className="h-[90px] bg-white border-b border-gray-200" />
})

export default function MyBetsPage() {
  const router = useRouter()
  
  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-white">
        <Header />
        <div className="pt-[70px]">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">My Bets</h1>
              
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                {/* Betting Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-600 text-sm font-medium">Total Bets</div>
                    <div className="text-2xl font-bold text-blue-800">12</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 text-sm font-medium">Won</div>
                    <div className="text-2xl font-bold text-green-800">8</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm font-medium">Lost</div>
                    <div className="text-2xl font-bold text-red-800">4</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-purple-600 text-sm font-medium">Win Rate</div>
                    <div className="text-2xl font-bold text-purple-800">66.7%</div>
                  </div>
                </div>

                {/* Active Bets */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Bets</h3>
                  <div className="space-y-3">
                    {[
                      { id: 1, match: 'India vs Australia - 1st ODI', bet: 'India to Win', odds: 1.85, stake: 1000, potential: 1850, status: 'Live' },
                      { id: 2, match: 'England vs Pakistan - T20', bet: 'Over 6.5 Runs', odds: 1.90, stake: 500, potential: 950, status: 'Live' }
                    ].map((bet) => (
                      <div key={bet.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-800">{bet.match}</div>
                            <div className="text-sm text-gray-600">{bet.bet}</div>
                          </div>
                          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                            {bet.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Odds</div>
                            <div className="font-semibold">{bet.odds}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Stake</div>
                            <div className="font-semibold">₹{bet.stake}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Potential Win</div>
                            <div className="font-semibold text-green-600">₹{bet.potential}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Profit</div>
                            <div className="font-semibold text-green-600">₹{bet.potential - bet.stake}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Betting History */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bets</h3>
                  <div className="space-y-3">
                    {[
                      { id: 3, match: 'Mumbai vs Delhi - IPL', bet: 'Mumbai to Win', odds: 1.75, stake: 2000, result: 'Won', amount: 1500, date: '2024-01-14' },
                      { id: 4, match: 'Chennai vs Bangalore - IPL', bet: 'Over 8.5 Runs', odds: 1.80, stake: 1000, result: 'Lost', amount: -1000, date: '2024-01-13' },
                      { id: 5, match: 'Casino - Teen Patti', bet: 'Player Hand', odds: 2.00, stake: 500, result: 'Won', amount: 500, date: '2024-01-12' }
                    ].map((bet) => (
                      <div key={bet.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-800">{bet.match}</div>
                            <div className="text-sm text-gray-600">{bet.bet}</div>
                            <div className="text-xs text-gray-500">{bet.date}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            bet.result === 'Won' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {bet.result}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Odds</div>
                            <div className="font-semibold">{bet.odds}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Stake</div>
                            <div className="font-semibold">₹{bet.stake}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Amount</div>
                            <div className={`font-semibold ${bet.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {bet.amount > 0 ? '+' : ''}₹{bet.amount}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Status</div>
                            <div className="font-semibold text-gray-600">Settled</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    View All Bets
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}