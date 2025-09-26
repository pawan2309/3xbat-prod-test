import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';
import { io, Socket } from 'socket.io-client';

// Local types and functions for dashboard functionality
interface Match {
  id: string;
  beventId?: string;
  bmarketId?: string;
  ename: string;
  stime: string;
  gmid: number;
  iplay: boolean;
  status: string;
  tv: boolean;
  bm: boolean;
}

interface DashboardStats {
  totalMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  completedMatches: number;
  totalBets: number;
  totalAmount: number;
  totalUsers: number;
  activeUsers: number;
}

// Temporary local utility functions
const formatMatchStatus = (status: string): { text: string; className: string } => {
  switch (status.toUpperCase()) {
    case 'LIVE':
      return { text: 'Live', className: 'text-red-600 bg-red-100' };
    case 'UPCOMING':
      return { text: 'Upcoming', className: 'text-yellow-600 bg-yellow-100' };
    case 'COMPLETED':
      return { text: 'Completed', className: 'text-green-600 bg-green-100' };
    case 'CANCELLED':
      return { text: 'Cancelled', className: 'text-gray-600 bg-gray-100' };
    case 'POSTPONED':
      return { text: 'Postponed', className: 'text-blue-600 bg-blue-100' };
    default:
      return { text: status, className: 'text-gray-600 bg-gray-100' };
  }
};

const formatDate = (date: string, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string => {
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    case 'datetime':
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

const DashboardContent: React.FC = () => {
  // Local state
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [showClientVisible, setShowClientVisible] = useState(false);

  // Load dashboard stats from API (fallback if WebSocket doesn't provide stats)
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        console.log('📊 Loading dashboard stats as fallback...');
        const response = await fetch('https://operate.3xbat.com/api/dashboard/stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Dashboard stats response:', data);
          
          if (data.success && data.data) {
            const stats: DashboardStats = {
              totalMatches: data.data.matches?.total || 0,
              liveMatches: data.data.matches?.live || 0,
              upcomingMatches: data.data.matches?.upcoming || 0,
              completedMatches: data.data.matches?.closed || 0,
              totalBets: data.data.bets?.total || 0,
              totalAmount: data.data.financial?.totalStake || 0,
              totalUsers: data.data.users?.total || 0,
              activeUsers: data.data.users?.active || 0
            };
            setStats(stats);
            setStatsLoading(false);
            console.log('✅ Dashboard stats loaded successfully');
          }
        } else {
          console.error('❌ Failed to load dashboard stats:', response.status);
          setStatsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error loading dashboard stats:', error);
        setStatsLoading(false);
      }
    };

    // Only load stats if WebSocket doesn't provide them
    const timeout = setTimeout(() => {
      if (statsLoading) {
        loadDashboardStats();
      }
    }, 5000); // Wait 5 seconds for WebSocket data

    return () => clearTimeout(timeout);
  }, [statsLoading]);

  // Load cached data immediately for faster display
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedMatches = localStorage.getItem('cricket_matches_control');
        const cacheTimestamp = localStorage.getItem('cricket_matches_control_timestamp');
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

        if (cachedMatches && cacheAge < CACHE_DURATION) {
          const parsedMatches = JSON.parse(cachedMatches);
          console.log('📦 Loading cached matches:', parsedMatches.length, 'matches');
          if (Array.isArray(parsedMatches)) {
            setMatches(parsedMatches);
            setMatchesLoading(false);
          }
      }
    } catch (error) {
        console.log('❌ Error loading cached data:', error);
      }
    };

    loadCachedData();
    
    // If no cached data, try immediate API call for faster loading
    if (!localStorage.getItem('cricket_matches_control')) {
      const immediateApiCall = async () => {
        try {
          console.log('🚀 Making immediate API call for faster loading...');
          const response = await fetch('https://operate.3xbat.com/api/cricket/fixtures', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
      const data = await response.json();
            console.log('📊 Immediate API response:', data);
            
            const allFixtures: Match[] = [];
            if (data.success && data.data && data.data.fixtures) {
              if (Array.isArray(data.data.fixtures)) {
                allFixtures.push(...data.data.fixtures);
              } else if (typeof data.data.fixtures === 'object') {
                Object.values(data.data.fixtures).forEach((fixtureArray: any) => {
                  if (Array.isArray(fixtureArray)) {
                    allFixtures.push(...fixtureArray);
                  }
                });
              }
            }
            
            if (allFixtures.length > 0) {
              const cricketMatches: Match[] = allFixtures.map((match: any) => ({
                id: match.gmid?.toString() || match.beventId || 'unknown',
                beventId: match.beventId,
                bmarketId: match.bmarketId,
                ename: match.ename,
                stime: match.stime,
                gmid: match.gmid,
                iplay: match.iplay,
                status: match.status || (match.iplay ? 'LIVE' : 'UPCOMING'),
                tv: match.tv,
                bm: match.bm
              }));

              setMatches(cricketMatches);
              setMatchesLoading(false);
              
              // Cache the data
              localStorage.setItem('cricket_matches_control', JSON.stringify(cricketMatches));
              localStorage.setItem('cricket_matches_control_timestamp', Date.now().toString());
              
              const stats: DashboardStats = {
                totalMatches: cricketMatches.length,
                liveMatches: cricketMatches.filter(m => m.iplay).length,
                upcomingMatches: cricketMatches.filter(m => !m.iplay).length,
                completedMatches: 0,
                totalBets: 0,
                totalAmount: 0,
                totalUsers: 0,
                activeUsers: 0
              };
              setStats(stats);
              setStatsLoading(false);
              console.log('✅ Immediate API call successful:', cricketMatches.length, 'matches');
            }
      }
    } catch (error) {
          console.log('❌ Immediate API call failed:', error);
        }
      };
      
      immediateApiCall();
    }
  }, []);

  // WebSocket connection for real-time cricket data
  useEffect(() => {
    const newSocket = io('wss://operate.3xbat.com', {
      transports: ['websocket'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('✅ Control Panel WebSocket connected');
      setSocket(newSocket);
      // Join the matches room to receive fixture data
      newSocket.emit('join_room', { room: 'global:matches' });
      // Join the dashboard room to receive stats data
      newSocket.emit('join_room', { room: 'global:dashboard' });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Control Panel WebSocket disconnected');
      setSocket(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      // Fallback: stop loading after 10 seconds if WebSocket fails
      setTimeout(() => {
        if (matches.length === 0) {
          console.log('⚠️ WebSocket failed, showing empty state');
          setMatchesLoading(false);
          setStatsLoading(false);
        }
      }, 10000);
    });

    // Listen for dashboard stats updates
    newSocket.on('dashboard_stats_updated', (data: any) => {
      console.log('📊 Received dashboard stats update via WebSocket:', data);
      
      if (data.success && data.data) {
        const stats: DashboardStats = {
          totalMatches: data.data.matches?.total || 0,
          liveMatches: data.data.matches?.live || 0,
          upcomingMatches: data.data.matches?.upcoming || 0,
          completedMatches: data.data.matches?.closed || 0,
          totalBets: data.data.bets?.total || 0,
          totalAmount: data.data.financial?.totalStake || 0,
          totalUsers: data.data.users?.total || 0,
          activeUsers: data.data.users?.active || 0
        };
        setStats(stats);
        setStatsLoading(false);
        console.log('✅ Dashboard stats updated via WebSocket');
      }
    });

    // Listen for matches/fixtures updates
    newSocket.on('matches_updated', (data: any) => {
      console.log('📊 Received matches update via WebSocket:', data);
      
      // Use the same data extraction logic as client panel
      const allFixtures: Match[] = [];
      
      if (data.data) {
        if (Array.isArray(data.data)) {
          // If data.data is already an array
          allFixtures.push(...data.data);
        } else if (data.data.fixtures) {
          // If data.data has fixtures property
          if (typeof data.data.fixtures === 'object' && !Array.isArray(data.data.fixtures)) {
            // If fixtures is an object with keys like "t1", "t2", etc.
            Object.values(data.data.fixtures).forEach((fixtureArray: any) => {
              if (Array.isArray(fixtureArray)) {
                allFixtures.push(...fixtureArray);
              }
            });
          } else if (Array.isArray(data.data.fixtures)) {
            // If fixtures is already an array
            allFixtures.push(...data.data.fixtures);
          }
        }
      }
      
      if (allFixtures.length > 0) {
        console.log('✅ WebSocket data valid, setting matches:', allFixtures.length, 'matches');
        
        const cricketMatches: Match[] = allFixtures.map((match: any) => ({
          id: match.gmid?.toString() || match.beventId || 'unknown',
          beventId: match.beventId,
          bmarketId: match.bmarketId,
          ename: match.ename,
          stime: match.stime,
          gmid: match.gmid,
          iplay: match.iplay,
          status: match.iplay ? 'LIVE' : 'UPCOMING',
          tv: match.tv,
          bm: match.bm
        }));

        setMatches(cricketMatches);
        setMatchesLoading(false);

        // Cache the data for faster future loads
        localStorage.setItem('cricket_matches_control', JSON.stringify(cricketMatches));
        localStorage.setItem('cricket_matches_control_timestamp', Date.now().toString());
        console.log('💾 WebSocket data cached successfully');

        // Stats are now handled by WebSocket dashboard_stats_updated event
        // No need to calculate stats here as they come from the database
      } else {
        console.log('❌ No valid fixtures found in WebSocket data');
      }
    });

    // Fallback: If no data received within 10 seconds, try direct API call
    const fallbackTimeout = setTimeout(async () => {
      if (matches.length === 0 && matchesLoading) {
        console.log('⏰ WebSocket timeout, trying direct API call...');
        try {
          const response = await fetch('https://operate.3xbat.com/api/cricket/fixtures', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Fallback API response:', data);
            
            // Use the same data extraction logic
            const allFixtures: Match[] = [];
            
            if (data.success && data.data && data.data.fixtures) {
              if (Array.isArray(data.data.fixtures)) {
                allFixtures.push(...data.data.fixtures);
              } else if (typeof data.data.fixtures === 'object') {
                Object.values(data.data.fixtures).forEach((fixtureArray: any) => {
                  if (Array.isArray(fixtureArray)) {
                    allFixtures.push(...fixtureArray);
                  }
                });
              }
            }
            
            if (allFixtures.length > 0) {
              const cricketMatches: Match[] = allFixtures.map((match: any) => ({
                id: match.gmid?.toString() || match.beventId || 'unknown',
                beventId: match.beventId,
                bmarketId: match.bmarketId,
                ename: match.ename,
                stime: match.stime,
                gmid: match.gmid,
                iplay: match.iplay,
                status: match.status || (match.iplay ? 'LIVE' : 'UPCOMING'),
                tv: match.tv,
                bm: match.bm
              }));

              setMatches(cricketMatches);
              setMatchesLoading(false);

              // Cache the data for faster future loads
              localStorage.setItem('cricket_matches_control', JSON.stringify(cricketMatches));
              localStorage.setItem('cricket_matches_control_timestamp', Date.now().toString());
              console.log('💾 Fallback API data cached successfully');

              // Stats are now handled by WebSocket dashboard_stats_updated event
              // No need to calculate stats here as they come from the database
              console.log('📊 Fallback API call successful:', cricketMatches.length, 'matches');
            } else {
              console.log('❌ No valid fixtures in fallback API response');
              setMatchesLoading(false);
              setStatsLoading(false);
            }
          }
        } catch (error) {
          console.log('❌ Fallback API call failed:', error);
          setMatchesLoading(false);
          setStatsLoading(false);
        }
      }
    }, 10000); // 10 seconds timeout like client panel

    return () => {
      clearTimeout(fallbackTimeout);
      newSocket.close();
    };
  }, [matches.length, matchesLoading]);

  // Auto-refresh every 30 seconds (WebSocket handles real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // WebSocket automatically provides updates, no manual refresh needed
      console.log('Auto-refresh: WebSocket handles real-time updates');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDeclareResult = (matchId: string) => {
    console.log('Declaring result for match:', matchId);
    alert(`Declaring result for match ${matchId}`);
  };

  const handleUndeclareMatch = (matchId: string) => {
    console.log('Undeclaring match:', matchId);
    alert(`Undeclaring match ${matchId}`);
  };

  const handleAddMatch = () => {
    console.log('Adding new match');
    alert('Add New Match functionality');
  };

  const handleRefresh = () => {
    // WebSocket automatically provides real-time updates
    console.log('Refresh: WebSocket handles real-time updates');
  };

  const handleToggleClientVisibility = (matchId: string) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const handleBulkToggleClientVisibility = () => {
    if (selectedMatches.length === matches.length) {
      setSelectedMatches([]);
    } else {
      setSelectedMatches(matches.map(match => match.id));
    }
  };

  const columns = [
    { key: 'serialNo', label: 'S.No' },
    { key: 'matchId', label: 'Match ID' },
    { key: 'matchName', label: 'Event Name' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'actions', label: 'Actions' }
  ];

  // Sort matches by start time in ascending order
  const sortedMatches = [...matches].sort((a, b) => {
    const timeA = new Date(a.stime).getTime();
    const timeB = new Date(b.stime).getTime();
    return timeA - timeB;
  });

  const rows = sortedMatches.map((match, index) => {
    const matchId = match.beventId || match.bmarketId || match.gmid.toString();
    const isClientVisible = selectedMatches.includes(matchId);
    
    return {
      ...match,
      serialNo: index + 1,
      matchId: (
        <button
          onClick={() => window.open(`/match/${matchId}`, '_blank')}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
        >
          {matchId}
        </button>
      ),
      matchName: (
        <div className="flex items-center">
          <span>{match.ename}</span>
          {match.iplay && (
            <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
          )}
        </div>
      ),
      startTime: formatDate(match.stime, 'datetime'),
      actions: (
        <div className="flex space-x-1">
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
            onClick={() => handleDeclareResult(matchId)}
          >
            Decision Modal
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
            onClick={() => handleUndeclareMatch(matchId)}
          >
            Fancy Dec.
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
            onClick={() => handleToggleClientVisibility(matchId)}
          >
            Fancy Bet
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-medium py-1 px-2 rounded transition-colors"
            onClick={() => handleDeclareResult(matchId)}
          >
            Odds Bet
          </button>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
            onClick={() => handleRefresh()}
          >
            Refresh Page
          </button>
        </div>
      )
    };
  });

  // Show loading state for data loading
  if (matchesLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  // No error state needed since we're using mock data

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏏 Cricket Dashboard</h1>
          <p className="text-sm text-gray-600">Manage cricket matches, odds, and results</p>
        </div>
      </div>


      {/* Match Management Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Match Management</h2>
        </div>
        <div className="p-4">
          {matches.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-gray-400 text-4xl mb-3">🏏</div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No matches found</h3>
              <p className="text-sm text-gray-600 mb-3">
                {socket ? 'Waiting for cricket match data...' : 'WebSocket connection failed. Please check if the backend server is running.'}
              </p>
              <Button variant="primary" size="small" onClick={handleAddMatch}>
                Add First Match
              </Button>
            </div>
          ) : (
            <Table columns={columns} rows={rows} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;