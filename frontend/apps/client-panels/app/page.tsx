'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Skip login and go directly to dashboard for testing
    router.push('/dashboard')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-dvh bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to Dashboard...</p>
      </div>
    </div>
  )
}
