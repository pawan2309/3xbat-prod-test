import React from 'react'

interface TVPlayerProps {
  matchId: string
  isLive: boolean
  className?: string
}

export default function TVPlayer({ 
  matchId, 
  isLive, 
  className = '' 
}: TVPlayerProps) {
  // Check if we should show TV: must have matchId and be live
  const shouldShowTV = matchId && isLive
  
  if (!shouldShowTV) {
    // Show blank placeholder when TV is not available
    return (
      <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="relative w-full h-64 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📺</div>
            <div className="text-sm">TV Not Available</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="relative w-full h-64">
        <iframe
          src={`http://localhost:4000/api/cricket/tv/html?eventId=${matchId}`}
          className="w-full h-full border-0"
          allowFullScreen
          title={`Live TV Stream - Match ${matchId}`}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          onLoad={() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('📺 TV Player iframe loaded for match:', matchId)
            }
          }}
          onError={(e) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('📺 TV Player iframe error:', e)
            }
          }}
        />
        <div className="absolute top-2 right-2">
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            LIVE
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 p-1 rounded">
            Debug: {matchId}
          </div>
        )}
      </div>
    </div>
  )
}
