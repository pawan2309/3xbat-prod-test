'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ProtectedLayout from '@/components/ProtectedLayout'

interface StatementRow {
  date: string
  desc: string
  debit: string
  credit: string
  balance: string
}

interface StatementSummary {
  openingBalance: number
  totalCredits: number
  totalDebits: number
  closingBalance: number
}

export default function ClientStatementPage() {
  const router = useRouter()
  const [statementRows, setStatementRows] = useState<StatementRow[]>([])
  const [summary, setSummary] = useState<StatementSummary>({
    openingBalance: 0,
    totalCredits: 0,
    totalDebits: 0,
    closingBalance: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days')

  // Fetch statement data from API
  const fetchStatementData = async (period: string) => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/statement?period=${period}`)
      // const data = await response.json()
      
      // For now, show empty state
      setStatementRows([])
      setSummary({
        openingBalance: 0,
        totalCredits: 0,
        totalDebits: 0,
        closingBalance: 0
      })
    } catch (err) {
      setError('Failed to load statement data')
      console.error('Error fetching statement data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatementData(selectedPeriod)
  }, [selectedPeriod])

  const handleGenerateStatement = () => {
    fetchStatementData(selectedPeriod)
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="w-full">
          <div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-red-600 text-white font-bold text-md p-2 border border-red-800 hover:bg-red-700 transition-colors"
            >
              BACK TO MENU
            </button>
          </div>
          
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading statement data...</p>
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
        <div className="w-full">
          <div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-red-600 text-white font-bold text-md p-2 border border-red-800 hover:bg-red-700 transition-colors"
            >
              BACK TO MENU
            </button>
          </div>
          
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Statement</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => fetchStatementData(selectedPeriod)}
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
        
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Passbook</h1>
            
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              {/* Statement Period Selector */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Account Statement</h3>
                  <div className="flex gap-2">
                    <select 
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Last 7 days">Last 7 days</option>
                      <option value="Last 30 days">Last 30 days</option>
                      <option value="Last 3 months">Last 3 months</option>
                      <option value="Custom Range">Custom Range</option>
                    </select>
                    <button 
                      onClick={handleGenerateStatement}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Statement Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 text-sm font-medium">Opening Balance</div>
                  <div className="text-xl font-bold text-blue-800">₹{summary.openingBalance.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium">Total Credits</div>
                  <div className="text-xl font-bold text-green-800">₹{summary.totalCredits.toLocaleString()}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-600 text-sm font-medium">Total Debits</div>
                  <div className="text-xl font-bold text-red-800">₹{summary.totalDebits.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-purple-600 text-sm font-medium">Closing Balance</div>
                  <div className="text-xl font-bold text-purple-800">₹{summary.closingBalance.toLocaleString()}</div>
                </div>
              </div>

              {/* Detailed Statement */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Debit</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Credit</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No statement data available for the selected period
                        </td>
                      </tr>
                    ) : (
                      statementRows.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600">{row.date}</td>
                          <td className="py-3 px-4 text-gray-800">{row.desc}</td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">{row.debit}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">{row.credit}</td>
                          <td className="py-3 px-4 text-right text-gray-800 font-semibold">{row.balance}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Download PDF
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Email Statement
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  Print Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}