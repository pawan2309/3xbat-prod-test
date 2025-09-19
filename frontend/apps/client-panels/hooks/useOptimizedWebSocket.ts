import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  userId: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface RoomSubscription {
  roomId: string;
  type: 'match' | 'user' | 'global';
  callback: (data: any) => void;
}

export const useOptimizedWebSocket = (config: WebSocketConfig) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const subscriptions = useRef<Map<string, RoomSubscription>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:4000`;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://3xbat.com';
  };

  const connect = useCallback(() => {
    // Don't connect during build time or server-side rendering
    if (typeof window === 'undefined' || socket?.connected) return;

    const newSocket = io(getApiBaseUrl(), {
      query: { userId: config.userId },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;

      // Rejoin all subscribed rooms
      subscriptions.current.forEach((subscription) => {
        newSocket.emit('join_room', {
          roomId: subscription.roomId,
          type: subscription.type
        });
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        handleReconnect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionError(error.message);
      handleReconnect();
    });

    // Handle room-specific data
    newSocket.on('room_data', (data) => {
      const subscription = subscriptions.current.get(data.roomId);
      if (subscription) {
        subscription.callback(data);
      }
    });

    // Handle match-specific events
    newSocket.on('match_updated', (data) => {
      const subscription = subscriptions.current.get(`match:${data.matchId}`);
      if (subscription) {
        subscription.callback(data);
      }
    });

    newSocket.on('odds_updated', (data) => {
      const subscription = subscriptions.current.get(`match:${data.matchId}`);
      if (subscription) {
        subscription.callback({ type: 'odds', ...data });
      }
    });

    newSocket.on('scorecard_updated', (data) => {
      const subscription = subscriptions.current.get(`match:${data.matchId}`);
      if (subscription) {
        subscription.callback({ type: 'scorecard', ...data });
      }
    });

    newSocket.on('tv_availability_updated', (data) => {
      const subscription = subscriptions.current.get(`match:${data.matchId}`);
      if (subscription) {
        subscription.callback({ type: 'tv', ...data });
      }
    });

    // Handle global events
    newSocket.on('matches_data', (data) => {
      const subscription = subscriptions.current.get('global:matches');
      if (subscription) {
        subscription.callback(data);
      }
    });

    newSocket.on('user_data', (data) => {
      const subscription = subscriptions.current.get(`user:${config.userId}`);
      if (subscription) {
        subscription.callback(data);
      }
    });

    setSocket(newSocket);
  }, [config.userId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setIsConnected(false);
  }, [socket]);

  const handleReconnect = useCallback(() => {
    const maxAttempts = config.reconnectAttempts || 5;
    const delay = config.reconnectDelay || 1000;

    if (reconnectAttemptsRef.current >= maxAttempts) {
      console.error('❌ Max reconnection attempts reached');
      setConnectionError('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current++;
    const backoffDelay = delay * Math.pow(2, reconnectAttemptsRef.current - 1);

    console.log(`🔄 Attempting to reconnect in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, backoffDelay);
  }, [connect, config.reconnectAttempts, config.reconnectDelay]);

  const subscribeToRoom = useCallback((roomId: string, type: 'match' | 'user' | 'global', callback: (data: any) => void) => {
    if (!socket) {
      console.warn('⚠️ Socket not connected, cannot subscribe to room');
      return;
    }

    const fullRoomId = roomId.includes(':') ? roomId : `${type}:${roomId}`;
    
    // Store subscription
    subscriptions.current.set(fullRoomId, {
      roomId: fullRoomId,
      type,
      callback
    });

    // Join room
    socket.emit('join_room', {
      roomId: fullRoomId,
      type
    });

    console.log(`📡 Subscribed to room: ${fullRoomId}`);
  }, [socket]);

  const unsubscribeFromRoom = useCallback((roomId: string, type: 'match' | 'user' | 'global') => {
    if (!socket) return;

    const fullRoomId = roomId.includes(':') ? roomId : `${type}:${roomId}`;
    
    // Remove subscription
    subscriptions.current.delete(fullRoomId);

    // Leave room
    socket.emit('leave_room', {
      roomId: fullRoomId
    });

    console.log(`📡 Unsubscribed from room: ${fullRoomId}`);
  }, [socket]);

  const subscribeToMatch = useCallback((matchId: string, callback: (data: any) => void) => {
    subscribeToRoom(matchId, 'match', callback);
  }, [subscribeToRoom]);

  const unsubscribeFromMatch = useCallback((matchId: string) => {
    unsubscribeFromRoom(matchId, 'match');
  }, [unsubscribeFromRoom]);

  const subscribeToUser = useCallback((callback: (data: any) => void) => {
    subscribeToRoom(config.userId, 'user', callback);
  }, [subscribeToRoom, config.userId]);

  const subscribeToGlobal = useCallback((callback: (data: any) => void) => {
    subscribeToRoom('matches', 'global', callback);
  }, [subscribeToRoom]);

  const requestData = useCallback((type: string, matchId?: string) => {
    if (!socket) return;

    socket.emit('request_data', { type, matchId });
  }, [socket]);

  const updatePreferences = useCallback((preferences: any) => {
    if (!socket) return;

    socket.emit('update_preferences', preferences);
  }, [socket]);

  // Auto-connect on mount
  useEffect(() => {
    if (config.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, config.autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToRoom,
    unsubscribeFromRoom,
    subscribeToMatch,
    unsubscribeFromMatch,
    subscribeToUser,
    subscribeToGlobal,
    requestData,
    updatePreferences
  };
};
