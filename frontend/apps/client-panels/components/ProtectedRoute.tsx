'use client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Skip authentication for testing - allow direct access
  return <>{children}</>
}
