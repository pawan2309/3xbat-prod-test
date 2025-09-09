'use client'

import React from "react";
import { useParams } from 'next/navigation';

interface TVPlayerProps {
  eventId: string | number;
}

const TVPlayer: React.FC<TVPlayerProps> = ({ eventId }) => {
  return (
    <iframe
      src={`http://localhost:4000/api/cricket/tv/html?eventId=${eventId}`}
      style={{
        width: "100%",
        height: "500px",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
      }}
      allow="autoplay; encrypted-media"
    />
  );
};

export default function TVPage() {
  const params = useParams()
  const eventId = params.eventId as string

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center p-4">
      <TVPlayer eventId={eventId} />
    </div>
  )
}