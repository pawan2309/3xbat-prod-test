'use client'

import { useRouter } from 'next/navigation'

export default function ClientStatementPage() {
  const router = useRouter()
  
  return (
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
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                    <option>Custom Range</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Statement Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-600 text-sm font-medium">Opening Balance</div>
                <div className="text-xl font-bold text-blue-800">₹15,000</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-600 text-sm font-medium">Total Credits</div>
                <div className="text-xl font-bold text-green-800">₹12,500</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm font-medium">Total Debits</div>
                <div className="text-xl font-bold text-red-800">₹7,500</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-purple-600 text-sm font-medium">Closing Balance</div>
                <div className="text-xl font-bold text-purple-800">₹20,000</div>
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
                  {[
                    { date: '2024-01-15', desc: 'Deposit - Bank Transfer', debit: '', credit: '₹10,000', balance: '₹20,000' },
                    { date: '2024-01-14', desc: 'Bet - India vs Australia', debit: '₹500', credit: '', balance: '₹10,000' },
                    { date: '2024-01-14', desc: 'Win - India vs Australia', debit: '', credit: '₹925', balance: '₹10,500' },
                    { date: '2024-01-13', desc: 'Deposit - UPI Transfer', debit: '', credit: '₹2,500', balance: '₹9,575' },
                    { date: '2024-01-13', desc: 'Bet - Casino Teen Patti', debit: '₹200', credit: '', balance: '₹7,075' },
                    { date: '2024-01-12', desc: 'Withdrawal - Bank Transfer', debit: '₹2,000', credit: '', balance: '₹7,275' },
                    { date: '2024-01-11', desc: 'Deposit - Bank Transfer', debit: '', credit: '₹5,000', balance: '₹9,275' },
                    { date: '2024-01-10', desc: 'Bet - Mumbai vs Delhi', debit: '₹1,000', credit: '', balance: '₹4,275' },
                    { date: '2024-01-10', desc: 'Win - Mumbai vs Delhi', debit: '', credit: '₹750', balance: '₹5,275' }
                  ].map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{row.date}</td>
                      <td className="py-3 px-4 text-gray-800">{row.desc}</td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">{row.debit}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">{row.credit}</td>
                      <td className="py-3 px-4 text-right text-gray-800 font-semibold">{row.balance}</td>
                    </tr>
                  ))}
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
  )
}