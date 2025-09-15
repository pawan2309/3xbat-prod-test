import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

interface Bet {
  id: number;
  userId: string;
  username: string;
  matchName: string;
  betType: string;
  betAmount: number;
  odds: number;
  potentialWin: number;
  status: string;
  placedAt: string;
  matchDate: string;
}

const UndeclareMatchBetListContent: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBets, setSelectedBets] = useState<number[]>([]);
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
    { 
      key: 'select', 
      label: (
        <input
          type="checkbox"
          checked={selectedBets.length === filteredBets.length && filteredBets.length > 0}
          onChange={handleSelectAll}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      )
    },
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
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        bet.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        bet.status === 'Won' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {bet.status}
      </span>
    ),
    actions: (
      <div className="flex space-x-1">
        <button
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
          onClick={() => handleDeclareResult(bet.id)}
        >
          Declare
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
          onClick={() => handleUndeclareBet(bet.id)}
        >
          Undeclare
        </button>
      </div>
    )
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bet Management</h1>
          <p className="text-sm text-gray-600">Manage and declare betting results</p>
        </div>
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filter and Actions Section */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Bets</option>
                <option value="pending">Pending</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {filteredBets.length} bet{filteredBets.length !== 1 ? 's' : ''} found
              </span>
              {selectedBets.length > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  ({selectedBets.length} selected)
                </span>
              )}
            </div>
          </div>
          {selectedBets.length > 0 && (
            <div className="flex space-x-2">
              <button
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                onClick={() => handleBulkAction('Declare')}
              >
                Declare Selected
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                onClick={() => handleBulkAction('Undeclare')}
              >
                Undeclare Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bet Management Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Bet List</h2>
        </div>
        <div className="p-4">
          <Table columns={columns} rows={rows} selectable={true} />
        </div>
      </div>
    </div>
  );
};

export default UndeclareMatchBetListContent;