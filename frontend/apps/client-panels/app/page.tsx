'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../lib/auth'

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Root page: Checking authentication...'); // Debug log
        const isAuthenticated = await authService.checkSession()
        console.log('Root page: Authentication result:', isAuthenticated); // Debug log
        
        if (isAuthenticated) {
          console.log('Root page: User authenticated, redirecting to dashboard...'); // Debug log
          window.location.href = '/dashboard'
        } else {
          console.log('Root page: User not authenticated, redirecting to login...'); // Debug log
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Root page: Auth check error:', error)
        router.push('/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // Show loading while checking authentication
  return (
    <div className="min-h-dvh bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          {isChecking ? 'Checking authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}
