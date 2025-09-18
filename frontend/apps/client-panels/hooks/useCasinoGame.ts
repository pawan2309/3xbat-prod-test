'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CasinoGameData {
  mid: string;
  autotime: number;
  remark: string;
  gtype: string;
  min: number;
  max: number;
  C1: string;
  C2: string;
  C3: string;
  C4: string;
  C5: string;
  C6: string;
}

export interface CasinoBettingData {
  mid: string;
  nation: string;
  sid: string;
  rate: string;
  gstatus: string;
  min: number;
  max: number;
  b1?: string;
  l1?: string;
}

export interface CasinoGameResult {
  result: string;
  mid: string;
}

export interface CasinoApiResponse {
  success: boolean;
  data: {
    t1: CasinoGameData[];
    t2: CasinoBettingData[];
  };
}

export interface CasinoResultsResponse {
  success: boolean;
  data: CasinoGameResult[];
}

export interface UseCasinoGameOptions {
  gameType: string;
  streamId: string;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface UseCasinoGameReturn {
  // Data
  gameData: CasinoApiResponse | null;
  results: CasinoResultsResponse | null;
  countdown: number;
  casinoTvUrl: string | null;
  
  // State
  loading: boolean;
  error: string | null;
  connected: boolean;
  
  // Actions
  reconnect: () => void;
  getBettingOdds: (sid: string) => { back: string; lay: string };
  getGameData: () => CasinoGameData | null;
  getLastResults: () => CasinoGameResult[];
}

export function useCasinoGame({
  gameType,
  streamId,
  onError,
  onConnectionChange
}: UseCasinoGameOptions): UseCasinoGameReturn {
  // State
  const [gameData, setGameData] = useState<CasinoApiResponse | null>(null);
  const [results, setResults] = useState<CasinoResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [casinoTvUrl, setCasinoTvUrl] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Error handler
  const handleError = useCallback((errorMessage: string) => {
    console.error(`🎰 Casino ${gameType} error:`, errorMessage);
    setError(errorMessage);
    onError?.(errorMessage);
  }, [gameType, onError]);

  // Connection handler
  const handleConnectionChange = useCallback((isConnected: boolean) => {
    setConnected(isConnected);
    onConnectionChange?.(isConnected);
  }, [onConnectionChange]);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setError(null);
    setLoading(true);
    // The useEffect will handle reconnection
  }, [socket]);

  // Get current game data
  const getGameData = useCallback((): CasinoGameData | null => {
    return gameData?.data?.t1?.[0] || null;
  }, [gameData]);

  // Get last results
  const getLastResults = useCallback((): CasinoGameResult[] => {
    return results?.data?.slice(0, 10) || [];
  }, [results]);

  // Get betting odds for a specific sid
  const getBettingOdds = useCallback((sid: string): { back: string; lay: string } => {
    if (!gameData?.data?.t2) return { back: '0.00', lay: '0.00' };
    
    const bet = gameData.data.t2.find((b: CasinoBettingData) => b.sid === sid);
    return {
      back: bet?.b1 || bet?.rate || '0.00',
      lay: bet?.l1 || '0.00'
    };
  }, [gameData]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const newSocket = io(socketUrl, {
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
      transports: ['websocket']
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log(`✅ Casino ${gameType} WebSocket connected`);
      setSocket(newSocket);
      handleConnectionChange(true);
      setError(null);
      
      // Join casino room
      newSocket.emit('join_casino_room', { game: gameType });
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`❌ Casino ${gameType} WebSocket disconnected:`, reason);
      setSocket(null);
      handleConnectionChange(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error(`❌ Casino ${gameType} WebSocket connection error:`, error);
      handleError(`Connection failed: ${error.message}`);
      handleConnectionChange(false);
    });

    // Data handlers
    newSocket.on('casino_tv_updated', (payload: any) => {
      if (payload.game === gameType && payload.data) {
        console.log(`🎰 Received casino TV data for ${gameType}:`, payload);
        setCasinoTvUrl(`${process.env.NEXT_PUBLIC_CASINO_VIDEO_URL || 'https://jmdapi.com/tablevideo/'}?id=${streamId}`);
      }
    });

    newSocket.on('casino_data_updated', (payload: any) => {
      if (payload.game === gameType && payload.data) {
        console.log(`🎰 Received casino data for ${gameType}:`, payload);
        setGameData(payload.data);
        setError(null);
      }
    });

    newSocket.on('casino_results_updated', (payload: any) => {
      if (payload.game === gameType && payload.data) {
        console.log(`🎰 Received casino results for ${gameType}:`, payload);
        setResults(payload.data);
      }
    });

    setSocket(newSocket);
    setLoading(false);

    return () => {
      newSocket.close();
    };
  }, [gameType, streamId, handleError, handleConnectionChange]);

  // Update countdown from game data
  useEffect(() => {
    const currentGameData = getGameData();
    if (currentGameData?.autotime !== undefined) {
      console.log(`⏰ Received autotime for ${gameType}:`, currentGameData.autotime);
      setCountdown(currentGameData.autotime);
    }
  }, [gameData, getGameData, gameType]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return {
    // Data
    gameData,
    results,
    countdown,
    casinoTvUrl,
    
    // State
    loading,
    error,
    connected,
    
    // Actions
    reconnect,
    getBettingOdds,
    getGameData,
    getLastResults
  };
}
