'use client'

import { useRouter } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'
import { useUserSummary } from '@/lib/hooks/useUserSummary'

export default function ProfilePage() {
  const router = useRouter()
  
  // Fetch real user data from API
  const { balance, exposure, creditLimit, availableBalance, isLoading: isUserLoading, error: userError } = useUserSummary()
  
  const user = {
    id: '1',
    username: 'User',
    name: 'User',
    role: 'client',
    balance: balance,
    isActive: true,
    code: 'N/A',
    contactno: 'N/A',
    creditLimit: creditLimit,
    exposure: exposure
  }

  if (isUserLoading) {
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
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (userError) {
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
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Profile</div>
                <p className="text-gray-600">Unable to load user profile. Please try again later.</p>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">My Profile</h1>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <p className="text-lg text-gray-900">{user?.username || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <p className="text-lg text-gray-900">{user?.name || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Code
                </label>
                <p className="text-lg text-gray-900">{user?.code || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <p className="text-lg text-gray-900">{user?.contactno || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <p className="text-lg text-gray-900 capitalize">{user?.role || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedLayout>
  )
}