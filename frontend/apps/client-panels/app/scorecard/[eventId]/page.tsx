'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import ScorecardDisplay from '../../../components/ScorecardDisplay';

interface ScorecardData {
  type: number;
  data: {
    spnnation1: string;
    spnnation2: string;
    spnballrunningstatus: string;
    score1: string;
    score2: string;
    spnrunrate1: string;
    spnrunrate2: string;
    spnmessage: string;
    spnreqrate1: string;
    spnreqrate2: string;
    dayno: string;
    isfinished: string;
    activenation1: string;
    activenation2: string;
    balls: string[];
  };
}

export default function ScorecardPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:4000`;
    }
    return 'http://localhost:4000';
  };

  const fetchScorecardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/cricket/scorecard?marketId=${eventId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setScorecardData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch scorecard data');
      }
    } catch (err) {
      console.error('Error fetching scorecard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scorecard data');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (eventId) {
      console.log('🔌 Connecting to WebSocket for scorecard...');
      const newSocket = io(getApiBaseUrl());
      setSocket(newSocket);

      // Initial data fetch
      fetchScorecardData();

      // Listen for scorecard updates
      newSocket.on('cricket_scorecard', (data) => {
        console.log('📊 Received scorecard data via WebSocket:', data);
        if (data.type === 'cricket_scorecard' && data.data) {
          setScorecardData(data.data);
          setError(null);
        }
      });

      // Listen for connection events
      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected for scorecard');
      });

      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected for scorecard');
      });

      newSocket.on('error', (error) => {
        console.error('❌ WebSocket error for scorecard:', error);
      });

      // Request scorecard data
      newSocket.emit('request_scorecard', { eventId });
      console.log('📡 Requested scorecard data for eventId:', eventId);

      return () => {
        newSocket.close();
      };
    }
  }, [eventId]);

  // Request scorecard data when socket is ready
  useEffect(() => {
    if (socket && eventId) {
      socket.emit('request_scorecard', { eventId });
    }
  }, [socket, eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Scorecard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchScorecardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!scorecardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Scorecard Data</h2>
          <p className="text-gray-600">No scorecard data available for this match.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
      {/* Scorecard Display */}
        <ScorecardDisplay data={scorecardData.data} />
      </div>
    </div>
  );
}
