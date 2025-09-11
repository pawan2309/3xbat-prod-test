import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

interface Match {
  id: number;
  matchName: string;
  date: string;
  time: string;
  status: string;
  odds: {
    team1: number;
    team2: number;
    draw: number;
  };
  venue: string;
  series: string;
}

const DashboardContent: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMatches: 0,
    liveMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0
  });

  // Sample data for demonstration
  useEffect(() => {
    const sampleMatches = [
      {
        id: 1,
        matchName: 'India vs Australia - 1st ODI',
        date: '2024-01-15',
        time: '14:30',
        status: 'Live',
        odds: { team1: 1.85, team2: 2.10, draw: 3.20 },
        venue: 'Melbourne Cricket Ground',
        series: 'ODI Series 2024'
      },
      {
        id: 2,
        matchName: 'England vs Pakistan - 2nd Test',
        date: '2024-01-16',
        time: '10:00',
        status: 'Upcoming',
        odds: { team1: 2.15, team2: 1.75, draw: 3.50 },
        venue: 'Lord\'s Cricket Ground',
        series: 'Test Series 2024'
      },
      {
        id: 3,
        matchName: 'South Africa vs New Zealand - 3rd T20',
        date: '2024-01-17',
        time: '18:00',
        status: 'Completed',
        odds: { team1: 1.95, team2: 1.90, draw: 3.30 },
        venue: 'Newlands Cricket Ground',
        series: 'T20 Series 2024'
      },
      {
        id: 4,
        matchName: 'Bangladesh vs Sri Lanka - 1st ODI',
        date: '2024-01-18',
        time: '15:00',
        status: 'Upcoming',
        odds: { team1: 2.30, team2: 1.65, draw: 3.80 },
        venue: 'Shere Bangla National Stadium',
        series: 'ODI Series 2024'
      },
      {
        id: 5,
        matchName: 'West Indies vs Afghanistan - 2nd T20',
        date: '2024-01-19',
        time: '20:00',
        status: 'Live',
        odds: { team1: 1.70, team2: 2.25, draw: 3.60 },
        venue: 'Kensington Oval',
        series: 'T20 Series 2024'
      }
    ];
    
    setMatches(sampleMatches);
    
    // Calculate stats
    setStats({
      totalMatches: sampleMatches.length,
      liveMatches: sampleMatches.filter(m => m.status === 'Live').length,
      upcomingMatches: sampleMatches.filter(m => m.status === 'Upcoming').length,
      completedMatches: sampleMatches.filter(m => m.status === 'Completed').length
    });
  }, []);

  const handleDeclareResult = (matchId: number) => {
    console.log('Declaring result for match:', matchId);
    alert(`Declaring result for match ${matchId}`);
  };

  const handleUndeclareMatch = (matchId: number) => {
    console.log('Undeclaring match:', matchId);
    alert(`Undeclaring match ${matchId}`);
  };

  const handleAddMatch = () => {
    console.log('Adding new match');
    alert('Add New Match functionality');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Refreshing matches...');
    }, 1000);
  };

  const columns = [
    { key: 'matchName', label: 'Match Name' },
    { key: 'series', label: 'Series' },
    { key: 'venue', label: 'Venue' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'status', label: 'Status' },
    { key: 'odds', label: 'Odds' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = matches.map(match => ({
    ...match,
    odds: `${match.odds.team1} / ${match.odds.team2} / ${match.odds.draw}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        match.status === 'Live' ? 'bg-red-100 text-red-800' :
        match.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {match.status}
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
      </div>
    )
  }));

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
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.liveMatches}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingMatches}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.completedMatches}</p>
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
          <Table columns={columns} rows={rows} />
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