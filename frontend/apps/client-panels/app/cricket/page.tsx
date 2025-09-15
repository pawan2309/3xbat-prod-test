'use client'

import ProtectedLayout from '@/components/ProtectedLayout'
import CricketPageContent from '../../components/CricketPageContent'

export default function CricketPage() {
  return (
    <ProtectedLayout>
      <CricketPageContent />
    </ProtectedLayout>
  )
}

