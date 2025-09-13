import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

// Temporary local types and functions until shared-data package is properly linked
interface Match {
  id: string;
  matchName: string;
  date: string;
  time: string;
  status: string;
  odds?: {
    team1: number;
    team2: number;
    draw: number;
  };
  venue: string;
  series: string;
  createdAt: string;
  updatedAt: string;
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

const formatDate = (date: string, format: 'short' | 'long' | 'time' = 'short'): string => {
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
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [showClientVisible, setShowClientVisible] = useState(false);
  // No need for client-side check since SSR is disabled for this page

  // Fetch matches from API
  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      setMatchesError(null);
      const response = await fetch('http://localhost:4000/api/matches');
      const data = await response.json();
      
      if (data.success && data.data) {
        setMatches(data.data);
      } else {
        setMatchesError(data.error || 'Failed to fetch matches');
      }
    } catch (error) {
      setMatchesError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setMatchesLoading(false);
    }
  };

  // Fetch dashboard stats from API
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const response = await fetch('http://localhost:4000/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        setStatsError(data.error || 'Failed to fetch stats');
      }
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setStatsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMatches();
    fetchStats();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches();
      fetchStats();
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
    fetchMatches();
    fetchStats();
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
    { key: 'select', label: '' },
    { key: 'clientVisible', label: 'Client Visible' },
    { key: 'matchName', label: 'Match Name' },
    { key: 'series', label: 'Series' },
    { key: 'venue', label: 'Venue' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' },
    { key: 'odds', label: 'Odds' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = matches.map(match => {
    const statusInfo = formatMatchStatus(match.status);
    const isClientVisible = selectedMatches.includes(match.id);
    
    return {
      ...match,
      select: (
        <input
          type="checkbox"
          checked={selectedMatches.includes(match.id)}
          onChange={() => handleToggleClientVisibility(match.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      clientVisible: (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isClientVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isClientVisible ? 'Visible' : 'Hidden'}
        </span>
      ),
      odds: match.odds ? `${match.odds.team1} / ${match.odds.team2} / ${match.odds.draw}` : 'N/A',
      date: formatDate(match.date, 'short'),
      time: match.time,
      status: (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
      ),
      actions: (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="primary"
            onClick={() => handleDeclareResult(match.id)}
          >
            Declare Result
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleUndeclareMatch(match.id)}
          >
            Undeclare
          </Button>
          <Button
            size="small"
            variant={isClientVisible ? "secondary" : "primary"}
            onClick={() => handleToggleClientVisibility(match.id)}
          >
            {isClientVisible ? 'Hide from Client' : 'Show to Client'}
          </Button>
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

  // Show error state
  if (matchesError || statsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{matchesError || statsError}</p>
              </div>
              <div className="mt-4">
                <Button variant="primary" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏏 Cricket Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage cricket matches, odds, and results</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            size="medium"
            variant="primary"
            onClick={handleAddMatch}
          >
            ➕ Add New Match
          </Button>
          <Button
            size="medium"
            variant="secondary"
            onClick={handleRefresh}
            disabled={matchesLoading}
          >
            {matchesLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Matches</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalMatches || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">🔴</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Live Matches</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.liveMatches || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⏰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.upcomingMatches || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedMatches || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Visibility Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Client Visibility Controls</h3>
            <p className="text-sm text-gray-600 mt-1">Control which matches are visible to clients</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleBulkToggleClientVisibility}
            >
              {selectedMatches.length === matches.length ? 'Hide All from Client' : 'Show All to Client'}
            </Button>
            <div className="text-sm text-gray-600 flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                {selectedMatches.length} Visible
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {matches.length - selectedMatches.length} Hidden
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Management Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Match Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage cricket matches, declare results, and update odds</p>
        </div>
        <div className="p-6">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🏏</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-4">There are currently no matches available.</p>
              <Button variant="primary" onClick={handleAddMatch}>
                Add First Match
              </Button>
            </div>
          ) : (
            <Table columns={columns} rows={rows} />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-900">Update Odds</div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">View Reports</div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium text-gray-900">Match Settings</div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-sm font-medium text-gray-900">Notifications</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;