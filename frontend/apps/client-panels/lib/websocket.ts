import { io, Socket } from 'socket.io-client'

interface CasinoUpdate {
  gameType: string
  data: any
  timestamp: string
}

interface CasinoCountdown {
  gameType: string
  countdown: number
  roundId: string
  timestamp: number
}

interface CasinoOdds {
  gameType: string
  odds: any
  timestamp: number
}

interface CasinoResult {
  gameType: string
  result: any
  timestamp: number
}

class WebSocketManager {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.connect()
  }

  private connect() {
    // Don't connect during build time or server-side rendering
    if (typeof window === 'undefined') return;
    
    try {
      this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      })

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
      })

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ WebSocket disconnected:', reason)
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error)
        this.reconnectAttempts++
      })

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error)
    }
  }

  /**
   * Join a casino game room
   */
  joinCasinoGame(gameType: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-casino', { gameType })
      console.log(`🎰 Joined casino game: ${gameType}`)
    }
  }

  /**
   * Leave a casino game room
   */
  leaveCasinoGame(gameType: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-casino', { gameType })
      console.log(`🎰 Left casino game: ${gameType}`)
    }
  }

  /**
   * Subscribe to casino game updates
   */
  onCasinoUpdate(gameType: string, callback: (data: CasinoUpdate) => void) {
    if (this.socket) {
      this.socket.on('casino_update', (data: CasinoUpdate) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Subscribe to casino countdown updates
   */
  onCasinoCountdown(gameType: string, callback: (data: CasinoCountdown) => void) {
    if (this.socket) {
      this.socket.on('casino_countdown', (data: CasinoCountdown) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Subscribe to casino odds updates
   */
  onCasinoOdds(gameType: string, callback: (data: CasinoOdds) => void) {
    if (this.socket) {
      this.socket.on('casino_odds', (data: CasinoOdds) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Subscribe to casino results
   */
  onCasinoResult(gameType: string, callback: (data: CasinoResult) => void) {
    if (this.socket) {
      this.socket.on('casino_result', (data: CasinoResult) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Subscribe to casino game updates (general)
   */
  onCasinoGameUpdate(gameType: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('casino_game_update', (data: any) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Subscribe to casino state changes
   */
  onCasinoStateChange(gameType: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('casino_state_change', (data: any) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Subscribe to casino game events
   */
  onCasinoGameEvent(gameType: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('casino_game_event', (data: any) => {
        if (data.gameType === gameType) {
          callback(data)
        }
      })
    }
  }

  /**
   * Generic event listener (for compatibility)
   */
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Generic event listener removal (for compatibility)
   */
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  /**
   * Remove all listeners for a specific game
   */
  removeCasinoListeners(gameType: string) {
    if (this.socket) {
      this.socket.off('casino_update')
      this.socket.off('casino_countdown')
      this.socket.off('casino_odds')
      this.socket.off('casino_result')
      this.socket.off('casino_game_update')
      this.socket.off('casino_state_change')
      this.socket.off('casino_game_event')
      console.log(`🎰 Removed all listeners for game: ${gameType}`)
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      console.log('🔌 WebSocket disconnected')
    }
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager()
export default websocketManager
