'use client'

import React, { useState, useEffect } from "react";

interface TVPlayerProps {
  eventId: string | number;
}

const TVPlayer: React.FC<TVPlayerProps> = ({ eventId }) => {
  // Render iframe directly; server handles availability and caching

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/cricket/tv/html?eventId=${eventId}`}
          className="absolute top-0 left-0 w-full h-full"
          style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
          allow="autoplay; encrypted-media"
        />
      </div>
    </div>
  );
};

export default TVPlayer;
