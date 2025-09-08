'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Hls from 'hls.js'

export default function TVPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Get API base URL
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `
      http://${window.location.hostname}:4000`
    }
    return 'http://localhost:4000'
  }

  // Extract HLS URL from iframe HTML
  const extractHLSUrl = (html: string, eventId: string): string | null => {
    try {
      // Look for iframe src with .m3u8
      const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']*\.m3u8[^"']*)["']/i)
      if (iframeMatch) {
        return iframeMatch[1]
      }

      // Look for direct .m3u8 URLs in the HTML
      const urlMatch = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/i)
      if (urlMatch) {
        return urlMatch[1]
      }

      // Look for the specific OvenPlayer pattern: "file": "https://mis3.sqmr.xyz:3334/app/" + eventId + "/llhls.m3u8"
      const specificPattern = html.match(/"file":\s*"https:\/\/mis3\.sqmr\.xyz:3334\/app\/"\s*\+\s*eventId\s*\+\s*"\/llhls\.m3u8"/i)
      if (specificPattern) {
        return `https://mis3.sqmr.xyz:3334/app/${eventId}/llhls.m3u8`
      }

      // Look for any pattern with " + eventId + " and .m3u8
      const eventIdPattern = html.match(/"file":\s*"([^"]*)\/\s*\+\s*eventId\s*\+\s*[^"]*\.m3u8"/i)
      if (eventIdPattern) {
        const baseUrl = eventIdPattern[1]
        return `${baseUrl}/${eventId}/llhls.m3u8`
      }

      // Look for mis3.sqmr.xyz with any pattern
      const mis3Pattern = html.match(/mis3\.sqmr\.xyz[^"']*llhls\.m3u8/i)
      if (mis3Pattern) {
        // Try to extract base URL from the pattern
        const baseMatch = html.match(/(https:\/\/mis3\.sqmr\.xyz[^"']*)\/\s*\+\s*eventId\s*\+\s*/i)
        if (baseMatch) {
          return `${baseMatch[1]}/${eventId}/llhls.m3u8`
        }
        // Fallback to known pattern
        return `https://mis3.sqmr.xyz:3334/app/${eventId}/llhls.m3u8`
      }

      // Look for any streaming URLs
      const streamMatch = html.match(/(https?:\/\/[^\s"']*stream[^\s"']*)/i)
      if (streamMatch) {
        return streamMatch[1]
      }

      return null
    } catch (error) {
      console.error('Error extracting HLS URL:', error)
      return null
    }
  }

  // Initialize HLS.js player
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return

    const video = videoRef.current
    let hlsUrl = streamUrl

    // If streamUrl is HTML, try to extract HLS URL
    if (streamUrl.includes('<iframe') || streamUrl.includes('<!DOCTYPE')) {
      console.log('Stream URL is HTML, extracting HLS URL...')
      const extractedUrl = extractHLSUrl(streamUrl, eventId)
      if (extractedUrl) {
        hlsUrl = extractedUrl
        console.log('✅ Extracted HLS URL:', hlsUrl)
      } else {
        console.log('❌ Failed to extract HLS URL from HTML')
        // Fallback to iframe embed
        setError('No HLS stream URL found in iframe')
        return
      }
    } else {
      console.log('Stream URL is direct URL:', streamUrl)
    }

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Check if HLS is supported
    console.log('HLS supported:', Hls.isSupported())
    console.log('HLS URL to load:', hlsUrl)
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        liveDurationInfinity: true,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveBackBufferLength: 0,
        maxLiveSyncPlaybackRate: 1.5,
        liveSyncDuration: 2
      })
      
      console.log('HLS instance created')
      
      hlsRef.current = hls
      
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, starting playback')
        console.log('HLS levels:', hls.levels)
        console.log('HLS current level:', hls.currentLevel)
        video.play().catch(console.error)
        setIsPlaying(true)
        setLoading(false)
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error, trying to recover...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, trying to recover...')
              hls.recoverMediaError()
              break
            default:
              setError(`Stream error: ${data.details}`)
              hls.destroy()
              break
          }
        }
      })

      hls.on(Hls.Events.FRAG_LOADED, () => {
        console.log('HLS fragment loaded')
      })

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log('HLS level loaded')
      })
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.error)
        setIsPlaying(true)
        setLoading(false)
      })
    } else {
      setError('HLS is not supported in this browser')
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [streamUrl])

  // Fetch TV stream data
  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${getApiBaseUrl()}/api/cricket/tv?eventId=${eventId}`, {
          headers: {
            'Referer': 'batxgames.site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1'
          }
        })
        const data = await response.json()
        
        if (data.success && data.data) {
          // Check if it's HTML content (iframe embed)
          if (data.data.html) {
            setStreamUrl(data.data.html)
          } else if (data.data.streamUrl) {
            setStreamUrl(data.data.streamUrl)
          } else {
            setError('No stream data available')
          }
        } else {
          setError('Failed to fetch stream data')
        }
      } catch (err) {
        setError('Error fetching stream data')
        console.error('Error fetching TV data:', err)
      }
    }

    if (eventId) {
      fetchTVData()
    }
  }, [eventId])

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play()
          } else {
            videoRef.current.pause()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading stream...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-2">Stream Error</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // If streamUrl is HTML (iframe embed)
  if (streamUrl.includes('<iframe') || streamUrl.includes('<!DOCTYPE')) {
    return (
      <div className="w-full h-screen bg-black">
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: streamUrl }}
        />
      </div>
    )
  }

  // If streamUrl is a video URL
  return (
    <div className="w-full h-screen bg-black relative group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        autoPlay
        muted
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Video error:', e)
          setError('Video playback error')
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Controls Overlay */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play()
                } else {
                  videoRef.current.pause()
                }
              }
            }}
            className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-colors"
            title="Play/Pause (Space)"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Loading Live Stream...</p>
          </div>
        </div>
      )}

      {/* Stream Info */}
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black bg-opacity-50 text-white p-2 rounded text-sm">
          <p>Event ID: {eventId}</p>
          <p>Status: {isPlaying ? 'Live' : 'Paused'}</p>
          <p>Player: HLS.js</p>
          <p>Mode: Low Latency</p>
        </div>
      </div>

      {/* HLS Stats */}
      {hlsRef.current && (
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-50 text-white p-2 rounded text-xs">
            <p>HLS Level: {hlsRef.current.currentLevel}</p>
            <p>Buffer: {hlsRef.current.media?.buffered?.length || 0} ranges</p>
            <p>Latency: {hlsRef.current.latency || 0}s</p>
          </div>
        </div>
      )}
    </div>
  )
}
