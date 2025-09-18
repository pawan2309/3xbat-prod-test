'use client'

import { useParams } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'
import CricketPageContent from '../../../components/CricketPageContent'

export default function CricketEventPage() {
  const params = useParams()
  const eventId = params.eventId as string

  return (
    <ProtectedLayout>
      <CricketPageContent autoExpandEventId={eventId} initialShowScore={true} />
    </ProtectedLayout>
  )
}
