import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

const CasinoListContent: React.FC = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]);

  // Sample data for demonstration
  useEffect(() => {
    const sampleGames = [
      {
        id: 1,
        gameName: 'Diamond Roulette',
        gameType: 'Roulette',
        status: 'Active',
        minBet: 10,
        maxBet: 5000,
        houseEdge: 2.7,
        playersOnline: 45,
        totalBets: 125000,
        lastResult: 'Red 23',
        nextDraw: '2024-01-15 15:30:00'
      },
      {
        id: 2,
        gameName: 'Lucky Slots',
        gameType: 'Slots',
        status: 'Active',
        minBet: 5,
        maxBet: 1000,
        houseEdge: 3.2,
        playersOnline: 78,
        totalBets: 89000,
        lastResult: '777',
        nextDraw: '2024-01-15 15:32:00'
      },
      {
        id: 3,
        gameName: 'Blackjack Pro',
        gameType: 'Blackjack',
        status: 'Maintenance',
        minBet: 25,
        maxBet: 10000,
        houseEdge: 0.5,
        playersOnline: 0,
        totalBets: 0,
        lastResult: '21',
        nextDraw: '2024-01-15 16:00:00'
      },
      {
        id: 4,
        gameName: 'Baccarat Elite',
        gameType: 'Baccarat',
        status: 'Active',
        minBet: 50,
        maxBet: 25000,
        houseEdge: 1.06,
        playersOnline: 23,
        totalBets: 340000,
        lastResult: 'Banker',
        nextDraw: '2024-01-15 15:35:00'
      },
      {
        id: 5,
        gameName: 'Poker Room',
        gameType: 'Poker',
        status: 'Active',
        minBet: 100,
        maxBet: 50000,
        houseEdge: 5.0,
        playersOnline: 12,
        totalBets: 180000,
        lastResult: 'Royal Flush',
        nextDraw: '2024-01-15 15:40:00'
      }
    ];
    
    setGames(sampleGames);
  }, []);

  const handleSelectGame = (gameId: number) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGames.length === games.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(games.map(game => game.id));
    }
  };

  const handleStartGame = (gameId: number) => {
    console.log('Starting game:', gameId);
    alert(`Starting game ${gameId}`);
  };

  const handleStopGame = (gameId: number) => {
    console.log('Stopping game:', gameId);
    alert(`Stopping game ${gameId}`);
  };

  const handleDeclareResult = (gameId: number) => {
    console.log('Declaring result for game:', gameId);
    alert(`Declaring result for game ${gameId}`);
  };

  const handleBulkAction = (action: string) => {
    if (selectedGames.length === 0) {
      alert('Please select at least one game');
      return;
    }
    
    console.log(`${action} selected games:`, selectedGames);
    alert(`${action} ${selectedGames.length} selected games`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Refreshing games...');
    }, 1000);
  };

  const columns = [
    { key: 'select', label: '' },
    { key: 'gameName', label: 'Game Name' },
    { key: 'gameType', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'minBet', label: 'Min Bet' },
    { key: 'maxBet', label: 'Max Bet' },
    { key: 'houseEdge', label: 'House Edge' },
    { key: 'playersOnline', label: 'Players' },
    { key: 'totalBets', label: 'Total Bets' },
    { key: 'lastResult', label: 'Last Result' },
    { key: 'nextDraw', label: 'Next Draw' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = games.map(game => ({
    ...game,
    select: (
      <input
        type="checkbox"
        checked={selectedGames.includes(game.id)}
        onChange={() => handleSelectGame(game.id)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
    ),
    minBet: `$${game.minBet}`,
    maxBet: `$${game.maxBet.toLocaleString()}`,
    houseEdge: `${game.houseEdge}%`,
    totalBets: `$${game.totalBets.toLocaleString()}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        game.status === 'Active' ? 'bg-green-100 text-green-800' :
        game.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {game.status}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        {game.status === 'Active' ? (
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleStopGame(game.id)}
          >
            Stop
          </Button>
        ) : (
          <Button
            size="small"
            variant="primary"
            onClick={() => handleStartGame(game.id)}
          >
            Start
          </Button>
        )}
        <Button
          size="small"
          variant="primary"
          onClick={() => handleDeclareResult(game.id)}
        >
          Declare
        </Button>
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎰 Casino Operations</h1>
          <p className="text-gray-600 mt-1">Manage casino games and operations</p>
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
                <span className="text-blue-600 font-bold">🎮</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Games</h3>
              <p className="text-2xl font-bold text-gray-900">{games.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">🟢</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Games</h3>
              <p className="text-2xl font-bold text-gray-900">
                {games.filter(g => g.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Players</h3>
              <p className="text-2xl font-bold text-gray-900">
                {games.reduce((sum, game) => sum + game.playersOnline, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Bets</h3>
              <p className="text-2xl font-bold text-gray-900">
                ${games.reduce((sum, game) => sum + game.totalBets, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">🎲</div>
              <div className="text-sm font-medium text-gray-900">Add New Game</div>
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
              <div className="text-sm font-medium text-gray-900">Game Settings</div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">🔔</div>
              <div className="text-sm font-medium text-gray-900">Notifications</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            {selectedGames.length} of {games.length} selected
          </div>
          <div className="flex space-x-2">
            <Button
              size="small"
              variant="primary"
              onClick={() => handleBulkAction('Start')}
              disabled={selectedGames.length === 0}
            >
              Start Selected
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => handleBulkAction('Stop')}
              disabled={selectedGames.length === 0}
            >
              Stop Selected
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => handleBulkAction('Declare Results')}
              disabled={selectedGames.length === 0}
            >
              Declare Results
            </Button>
          </div>
        </div>
      </div>

      {/* Casino Games Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Casino Games</h2>
          <p className="text-sm text-gray-600 mt-1">Manage casino games, declare results, and monitor operations</p>
        </div>
        <div className="p-6">
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
};

export default CasinoListContent;