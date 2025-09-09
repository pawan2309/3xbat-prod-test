import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

const UndeclareMatchBetListContent: React.FC = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const [filter, setFilter] = useState('all');

  // Sample data for demonstration
  useEffect(() => {
    const sampleBets = [
      {
        id: 1,
        userId: 'USER001',
        username: 'john_doe',
        matchName: 'India vs Australia - 1st ODI',
        betType: 'Match Winner',
        betAmount: 500,
        odds: 1.85,
        potentialWin: 925,
        status: 'Pending',
        placedAt: '2024-01-15 14:30:00',
        matchDate: '2024-01-15 15:00:00'
      },
      {
        id: 2,
        userId: 'USER002',
        username: 'jane_smith',
        matchName: 'England vs Pakistan - 2nd Test',
        betType: 'Total Runs',
        betAmount: 1000,
        odds: 2.15,
        potentialWin: 2150,
        status: 'Pending',
        placedAt: '2024-01-16 10:15:00',
        matchDate: '2024-01-16 11:00:00'
      },
      {
        id: 3,
        userId: 'USER003',
        username: 'mike_wilson',
        matchName: 'South Africa vs New Zealand - 3rd T20',
        betType: 'First Wicket',
        betAmount: 750,
        odds: 1.95,
        potentialWin: 1462.5,
        status: 'Won',
        placedAt: '2024-01-17 17:45:00',
        matchDate: '2024-01-17 18:00:00'
      },
      {
        id: 4,
        userId: 'USER004',
        username: 'sarah_jones',
        matchName: 'Bangladesh vs Sri Lanka - 1st ODI',
        betType: 'Man of the Match',
        betAmount: 300,
        odds: 2.30,
        potentialWin: 690,
        status: 'Lost',
        placedAt: '2024-01-18 14:20:00',
        matchDate: '2024-01-18 15:00:00'
      },
      {
        id: 5,
        userId: 'USER005',
        username: 'alex_brown',
        matchName: 'West Indies vs Afghanistan - 2nd T20',
        betType: 'Highest Score',
        betAmount: 1200,
        odds: 1.70,
        potentialWin: 2040,
        status: 'Pending',
        placedAt: '2024-01-19 19:30:00',
        matchDate: '2024-01-19 20:00:00'
      }
    ];
    
    setBets(sampleBets);
  }, []);

  const handleSelectBet = (betId: number) => {
    setSelectedBets(prev => 
      prev.includes(betId) 
        ? prev.filter(id => id !== betId)
        : [...prev, betId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBets.length === filteredBets.length) {
      setSelectedBets([]);
    } else {
      setSelectedBets(filteredBets.map(bet => bet.id));
    }
  };

  const handleDeclareResult = (betId: number) => {
    console.log('Declaring result for bet:', betId);
    alert(`Declaring result for bet ${betId}`);
  };

  const handleUndeclareBet = (betId: number) => {
    console.log('Undeclaring bet:', betId);
    alert(`Undeclaring bet ${betId}`);
  };

  const handleBulkAction = (action: string) => {
    if (selectedBets.length === 0) {
      alert('Please select at least one bet');
      return;
    }
    
    console.log(`${action} selected bets:`, selectedBets);
    alert(`${action} ${selectedBets.length} selected bets`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Refreshing bets...');
    }, 1000);
  };

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true;
    if (filter === 'pending') return bet.status === 'Pending';
    if (filter === 'won') return bet.status === 'Won';
    if (filter === 'lost') return bet.status === 'Lost';
    return true;
  });

  const columns = [
    { key: 'select', label: '' },
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'matchName', label: 'Match' },
    { key: 'betType', label: 'Bet Type' },
    { key: 'betAmount', label: 'Amount' },
    { key: 'odds', label: 'Odds' },
    { key: 'potentialWin', label: 'Potential Win' },
    { key: 'status', label: 'Status' },
    { key: 'placedAt', label: 'Placed At' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = filteredBets.map(bet => ({
    ...bet,
    select: (
      <input
        type="checkbox"
        checked={selectedBets.includes(bet.id)}
        onChange={() => handleSelectBet(bet.id)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
    ),
    betAmount: `$${bet.betAmount.toLocaleString()}`,
    potentialWin: `$${bet.potentialWin.toLocaleString()}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        bet.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        bet.status === 'Won' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {bet.status}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <Button
          size="small"
          variant="primary"
          onClick={() => handleDeclareResult(bet.id)}
        >
          Declare
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => handleUndeclareBet(bet.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">💰 Bet Management</h1>
          <p className="text-gray-600 mt-1">Manage and declare betting results</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
              <h3 className="text-sm font-medium text-gray-500">Total Bets</h3>
              <p className="text-2xl font-bold text-gray-900">{bets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-bold text-gray-900">
                {bets.filter(b => b.status === 'Pending').length}
              </p>
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
              <h3 className="text-sm font-medium text-gray-500">Won</h3>
              <p className="text-2xl font-bold text-gray-900">
                {bets.filter(b => b.status === 'Won').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">❌</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Lost</h3>
              <p className="text-2xl font-bold text-gray-900">
                {bets.filter(b => b.status === 'Lost').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Bets</option>
                <option value="pending">Pending</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-600">
              {selectedBets.length} of {filteredBets.length} selected
            </div>
            <div className="flex space-x-2">
              <Button
                size="small"
                variant="primary"
                onClick={() => handleBulkAction('Declare')}
                disabled={selectedBets.length === 0}
              >
                Declare Selected
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => handleBulkAction('Undeclare')}
                disabled={selectedBets.length === 0}
              >
                Undeclare Selected
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bet Management Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bet List</h2>
          <p className="text-sm text-gray-600 mt-1">Manage individual bets and declare results</p>
        </div>
        <div className="p-6">
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
};

export default UndeclareMatchBetListContent;