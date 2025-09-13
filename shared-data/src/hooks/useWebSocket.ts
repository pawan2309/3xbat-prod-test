import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketService } from '../services';
import { WebSocketMessage, WebSocketEventHandlers } from '../types';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(event: string, data: T) => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  subscribeToMatchUpdates: (matchId: string) => void;
  unsubscribeFromMatchUpdates: (matchId: string) => void;
  subscribeToBetUpdates: (userId?: string) => void;
  unsubscribeFromBetUpdates: () => void;
  subscribeToUserUpdates: (userId?: string) => void;
  unsubscribeFromUserUpdates: () => void;
  subscribeToCasinoUpdates: (gameId?: string) => void;
  unsubscribeFromCasinoUpdates: () => void;
  subscribeToDashboardUpdates: () => void;
  unsubscribeFromDashboardUpdates: () => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, reconnectOnMount = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const webSocketServiceRef = useRef<WebSocketService | null>(null);

  const handlers: WebSocketEventHandlers = {
    onConnect: () => {
      setIsConnected(true);
    },
    onDisconnect: () => {
      setIsConnected(false);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    onMessage: (message) => {
      setLastMessage(message);
    },
  };

  const connect = useCallback(() => {
    if (!webSocketServiceRef.current) {
      webSocketServiceRef.current = new WebSocketService(handlers);
    }
    webSocketServiceRef.current.connect();
  }, []);

  const disconnect = useCallback(() => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.disconnect();
      webSocketServiceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const emit = useCallback(<T>(event: string, data: T) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.off(event, callback);
    }
  }, []);

  const subscribeToMatchUpdates = useCallback((matchId: string) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.subscribeToMatchUpdates(matchId);
    }
  }, []);

  const unsubscribeFromMatchUpdates = useCallback((matchId: string) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.unsubscribeFromMatchUpdates(matchId);
    }
  }, []);

  const subscribeToBetUpdates = useCallback((userId?: string) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.subscribeToBetUpdates(userId);
    }
  }, []);

  const unsubscribeFromBetUpdates = useCallback(() => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.unsubscribeFromBetUpdates();
    }
  }, []);

  const subscribeToUserUpdates = useCallback((userId?: string) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.subscribeToUserUpdates(userId);
    }
  }, []);

  const unsubscribeFromUserUpdates = useCallback(() => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.unsubscribeFromUserUpdates();
    }
  }, []);

  const subscribeToCasinoUpdates = useCallback((gameId?: string) => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.subscribeToCasinoUpdates(gameId);
    }
  }, []);

  const unsubscribeFromCasinoUpdates = useCallback(() => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.unsubscribeFromCasinoUpdates();
    }
  }, []);

  const subscribeToDashboardUpdates = useCallback(() => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.subscribeToDashboardUpdates();
    }
  }, []);

  const unsubscribeFromDashboardUpdates = useCallback(() => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.unsubscribeFromDashboardUpdates();
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (reconnectOnMount) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, reconnectOnMount]);

  return {
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
    subscribeToMatchUpdates,
    unsubscribeFromMatchUpdates,
    subscribeToBetUpdates,
    unsubscribeFromBetUpdates,
    subscribeToUserUpdates,
    unsubscribeFromUserUpdates,
    subscribeToCasinoUpdates,
    unsubscribeFromCasinoUpdates,
    subscribeToDashboardUpdates,
    unsubscribeFromDashboardUpdates,
    lastMessage,
  };
}
