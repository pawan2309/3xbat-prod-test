import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

interface Game {
  id: number;
  gameName: string;
  gameType: string;
  status: string;
  minBet: number;
  maxBet: number;
  houseEdge: number;
  playersOnline: number;
  totalBets: number;
  lastResult: string;
  nextDraw: string;
}

const CasinoListContent: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  // Load casino games from API
  useEffect(() => {
    loadCasinoGames();
  }, []);

  const loadCasinoGames = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/casino/games');
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiGames = result.data.map((game: any) => ({
          id: game.id,
          gameName: game.name,
          gameType: game.shortName,
          status: game.casinoStatus ? 'Active' : 'Disabled',
          minBet: game.minStake,
          maxBet: game.maxStake,
          houseEdge: 2.7, // Mock data
          playersOnline: Math.floor(Math.random() * 100), // Mock data
          totalBets: Math.floor(Math.random() * 500000), // Mock data
          lastResult: 'Result', // Mock data
          nextDraw: new Date().toLocaleString() // Mock data
        }));
        setGames(apiGames);
      } else {
        // Fallback to sample data
        loadSampleData();
      }
    } catch (error) {
      console.error('Error loading casino games:', error);
      // Fallback to sample data
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    const sampleGames = [
      {
        id: 1,
        gameName: 'Amar Akbar Anthony',
        gameType: 'AAA',
        status: 'Active',
        minBet: 10,
        maxBet: 5000,
        houseEdge: 2.7,
        playersOnline: 45,
        totalBets: 125000,
        lastResult: 'Amar',
        nextDraw: '2024-01-15 15:30:00'
      },
      {
        id: 2,
        gameName: 'Andar Bahar 20',
        gameType: 'AB20',
        status: 'Active',
        minBet: 5,
        maxBet: 1000,
        houseEdge: 3.2,
        playersOnline: 78,
        totalBets: 89000,
        lastResult: 'A',
        nextDraw: '2024-01-15 15:32:00'
      },
      {
        id: 3,
        gameName: 'Card 32 EU',
        gameType: 'Card32EU',
        status: 'Disabled',
        minBet: 25,
        maxBet: 10000,
        houseEdge: 0.5,
        playersOnline: 0,
        totalBets: 0,
        lastResult: '32',
        nextDraw: '2024-01-15 16:00:00'
      },
      {
        id: 4,
        gameName: 'Dragon Tiger 20',
        gameType: 'DT20',
        status: 'Active',
        minBet: 50,
        maxBet: 25000,
        houseEdge: 1.06,
        playersOnline: 23,
        totalBets: 340000,
        lastResult: 'D',
        nextDraw: '2024-01-15 15:35:00'
      },
      {
        id: 5,
        gameName: 'Lucky 7 EU',
        gameType: 'Lucky7EU',
        status: 'Active',
        minBet: 100,
        maxBet: 50000,
        houseEdge: 5.0,
        playersOnline: 12,
        totalBets: 180000,
        lastResult: '7',
        nextDraw: '2024-01-15 15:40:00'
      },
      {
        id: 6,
        gameName: '20-20 Teenpatti',
        gameType: 'Teen20',
        status: 'Active',
        minBet: 20,
        maxBet: 20000,
        houseEdge: 1.4,
        playersOnline: 34,
        totalBets: 95000,
        lastResult: 'Player A',
        nextDraw: '2024-01-15 15:45:00'
      }
    ];
    setGames(sampleGames);
  };


  const handleEditGame = (gameId: number) => {
    window.open(`/casino/${gameId}`, '_blank');
  };


  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Refreshing games...');
    }, 1000);
  };

  const columns = [
    { key: 'eventId', label: 'Event Id' },
    { key: 'name', label: 'Name' },
    { key: 'shortName', label: 'Short Name' },
    { key: 'betStatus', label: 'Bet Status' },
    { key: 'minStake', label: 'MinStake' },
    { key: 'maxStake', label: 'MaxStake' },
    { key: 'actions', label: 'Action' }
  ];

  const rows = games.map(game => ({
    eventId: game.id,
    name: game.gameName,
    shortName: game.gameType,
    betStatus: (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        game.status === 'Active' ? 'bg-green-100 text-green-800' :
        game.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {game.status}
      </span>
    ),
    minStake: `$${game.minBet}`,
    maxStake: `$${game.maxBet.toLocaleString()}`,
    actions: (
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
        onClick={() => handleEditGame(game.id)}
      >
        Edit
      </button>
    )
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casino Operations</h1>
          <p className="text-sm text-gray-600">Manage casino games and operations</p>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded transition-colors"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>


      {/* Casino Games Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Casino Games</h2>
        </div>
        <div className="p-4">
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
};

export default CasinoListContent;