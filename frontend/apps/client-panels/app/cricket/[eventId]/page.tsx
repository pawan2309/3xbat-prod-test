'use client'

import { useParams } from 'next/navigation'
import CricketPageContent from '../../../components/CricketPageContent'

export default function CricketEventPage() {
  const params = useParams()
  const eventId = params.eventId as string

  return <CricketPageContent autoExpandEventId={eventId} initialShowScore={true} />
}
