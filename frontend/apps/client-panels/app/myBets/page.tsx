'use client'

import { useRouter } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'

export default function MyBetsPage() {
  const router = useRouter()
  
  return (
    <ProtectedLayout>
      <div className="min-h-dvh bg-white">
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
          
          <div className="p-2 sm:p-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">My Bets</h1>
              
              {/* MATCH BETS Table */}
              <div className="mb-6">
                <div className="bg-blue-800 text-white text-center py-2 px-4 rounded-t-lg">
                  <h2 className="text-lg font-bold">MATCH BETS</h2>
                </div>
                <div className="bg-white border border-gray-300 rounded-b-lg overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-6 gap-4 bg-blue-800 text-white py-2 px-4 text-sm font-medium">
                      <div className="text-left">TEAM</div>
                      <div className="text-center">RATE</div>
                      <div className="text-center">MODE</div>
                      <div className="text-center">AMOUNT</div>
                      <div className="text-center">TIME</div>
                      <div className="text-right">STATUS</div>
                    </div>
                    <div className="p-4">
                      <div className="text-center text-gray-500 py-8">
                        No match bets
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Table - Horizontal Scroll */}
                  <div className="md:hidden overflow-x-auto">
                    <div className="min-w-[700px]">
                      <div className="grid grid-cols-6 gap-4 bg-blue-800 text-white py-2 px-4 text-xs font-medium">
                        <div className="text-left">TEAM</div>
                        <div className="text-center">RATE</div>
                        <div className="text-center">MODE</div>
                        <div className="text-center">AMOUNT</div>
                        <div className="text-center">TIME</div>
                        <div className="text-right">STATUS</div>
                      </div>
                      <div className="p-4">
                        <div className="text-center text-gray-500 py-8 text-sm">
                          No match bets
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 py-2 bg-gray-100">
                      ← Scroll horizontally to see all columns →
                    </div>
                  </div>
                </div>
                <div className="bg-gray-400 h-1 flex items-center">
                  <div className="w-3 h-3 bg-white transform rotate-45 ml-2"></div>
                </div>
              </div>

              {/* SESSION BETS Table */}
              <div className="mb-6">
                <div className="bg-blue-800 text-white text-center py-2 px-4 rounded-t-lg">
                  <h2 className="text-lg font-bold">SESSION BETS</h2>
                </div>
                <div className="bg-white border border-gray-300 rounded-b-lg overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-7 gap-4 bg-blue-800 text-white py-2 px-4 text-sm font-medium">
                      <div className="text-left">SESSION</div>
                      <div className="text-center">RATE</div>
                      <div className="text-center">AMOUNT</div>
                      <div className="text-center">RUNS</div>
                      <div className="text-center">MODE</div>
                      <div className="text-center">TIME</div>
                      <div className="text-right">STATUS</div>
                    </div>
                    <div className="p-4">
                      <div className="text-center text-gray-500 py-8">
                        No session bets
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Table - Horizontal Scroll */}
                  <div className="md:hidden overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-7 gap-4 bg-blue-800 text-white py-2 px-4 text-xs font-medium">
                        <div className="text-left">SESSION</div>
                        <div className="text-center">RATE</div>
                        <div className="text-center">AMOUNT</div>
                        <div className="text-center">RUNS</div>
                        <div className="text-center">MODE</div>
                        <div className="text-center">TIME</div>
                        <div className="text-right">STATUS</div>
                      </div>
                      <div className="p-4">
                        <div className="text-center text-gray-500 py-8 text-sm">
                          No session bets
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 py-2 bg-gray-100">
                      ← Scroll horizontally to see all columns →
                    </div>
                  </div>
                </div>
                <div className="bg-gray-400 h-1 flex items-center">
                  <div className="w-3 h-3 bg-white transform rotate-45 ml-2"></div>
                </div>
              </div>

              {/* CASINO BETS Table */}
              <div className="mb-6">
                <div className="bg-blue-800 text-white text-center py-2 px-4 rounded-t-lg">
                  <h2 className="text-lg font-bold">CASINO BETS</h2>
                </div>
                <div className="bg-white border border-gray-300 rounded-b-lg overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-7 gap-4 bg-blue-800 text-white py-2 px-4 text-sm font-medium">
                      <div className="text-left">CASINO</div>
                      <div className="text-center">NAME</div>
                      <div className="text-center">ROUND ID</div>
                      <div className="text-center">AMOUNT</div>
                      <div className="text-center">TIME</div>
                      <div className="text-center">TRANSACTION ID</div>
                      <div className="text-right">STATUS</div>
                    </div>
                    <div className="p-4">
                      <div className="text-center text-gray-500 py-8">
                        No casino bets
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Table - Horizontal Scroll */}
                  <div className="md:hidden overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-7 gap-4 bg-blue-800 text-white py-2 px-4 text-xs font-medium">
                        <div className="text-left">CASINO</div>
                        <div className="text-center">NAME</div>
                        <div className="text-center">ROUND ID</div>
                        <div className="text-center">AMOUNT</div>
                        <div className="text-center">TIME</div>
                        <div className="text-center">TRANSACTION ID</div>
                        <div className="text-right">STATUS</div>
                      </div>
                      <div className="p-4">
                        <div className="text-center text-gray-500 py-8 text-sm">
                          No casino bets
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 py-2 bg-gray-100">
                      ← Scroll horizontally to see all columns →
                    </div>
                  </div>
                </div>
                <div className="bg-gray-400 h-1 flex items-center">
                  <div className="w-3 h-3 bg-white transform rotate-45 ml-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}