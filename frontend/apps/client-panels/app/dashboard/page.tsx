'use client'

import ProtectedLayout from '@/components/ProtectedLayout'
import DashboardGrid from '@/components/DashboardGrid'
import Footer from '@/components/Footer'

export default function Dashboard() {
  return (
    <ProtectedLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center py-1 px-1 sm:p-2">
          <DashboardGrid />
        </div>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
