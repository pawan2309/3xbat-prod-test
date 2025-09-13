import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, WebSocketEventHandlers } from '../types';
import { getWebSocketConfig } from '../config';

export class WebSocketService {
  private socket: Socket | null = null;
  private config = getWebSocketConfig();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = this.config.reconnectAttempts;
  private reconnectDelay = this.config.reconnectDelay;

  constructor(private handlers: WebSocketEventHandlers = {}) {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.config.url, {
      transports: ['websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit a message to the server
   */
  emit<T>(event: string, data: T): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Cannot emit message.');
    }
  }

  /**
   * Subscribe to a specific event
   */
  on<T>(event: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from a specific event
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Subscribe to match updates
   */
  subscribeToMatchUpdates(matchId: string): void {
    this.emit('subscribe:match', { matchId });
  }

  /**
   * Unsubscribe from match updates
   */
  unsubscribeFromMatchUpdates(matchId: string): void {
    this.emit('unsubscribe:match', { matchId });
  }

  /**
   * Subscribe to bet updates
   */
  subscribeToBetUpdates(userId?: string): void {
    this.emit('subscribe:bets', { userId });
  }

  /**
   * Unsubscribe from bet updates
   */
  unsubscribeFromBetUpdates(): void {
    this.emit('unsubscribe:bets', {});
  }

  /**
   * Subscribe to user updates
   */
  subscribeToUserUpdates(userId?: string): void {
    this.emit('subscribe:users', { userId });
  }

  /**
   * Unsubscribe from user updates
   */
  unsubscribeFromUserUpdates(): void {
    this.emit('unsubscribe:users', {});
  }

  /**
   * Subscribe to casino game updates
   */
  subscribeToCasinoUpdates(gameId?: string): void {
    this.emit('subscribe:casino', { gameId });
  }

  /**
   * Unsubscribe from casino game updates
   */
  unsubscribeFromCasinoUpdates(): void {
    this.emit('unsubscribe:casino', {});
  }

  /**
   * Subscribe to dashboard updates
   */
  subscribeToDashboardUpdates(): void {
    this.emit('subscribe:dashboard', {});
  }

  /**
   * Unsubscribe from dashboard updates
   */
  unsubscribeFromDashboardUpdates(): void {
    this.emit('unsubscribe:dashboard', {});
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.handlers.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.handlers.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handlers.onError?.(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      this.handlers.onError?.(error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after', this.maxReconnectAttempts, 'attempts');
      this.handlers.onError?.(new Error('WebSocket reconnection failed'));
    });

    // Generic message handler
    this.socket.on('message', (message: WebSocketMessage) => {
      this.handlers.onMessage?.(message);
    });

    // Specific event handlers
    this.socket.on('match:update', (data) => {
      this.handlers.onMessage?.({
        type: 'match:update',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('bet:update', (data) => {
      this.handlers.onMessage?.({
        type: 'bet:update',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('user:update', (data) => {
      this.handlers.onMessage?.({
        type: 'user:update',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('casino:update', (data) => {
      this.handlers.onMessage?.({
        type: 'casino:update',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('dashboard:update', (data) => {
      this.handlers.onMessage?.({
        type: 'dashboard:update',
        data,
        timestamp: new Date().toISOString(),
      });
    });
  }
}
