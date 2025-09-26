import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

interface CasinoData {
  name: string;
  shortName: string;
  eventId: string;
  videoUrl1: string;
  minStake: number;
  maxStake: number;
  betStatus?: boolean;
  casinoStatus?: boolean;
  errorMessage?: string;
}

// Casino game data mapping
const casinoGames: { [key: string]: CasinoData } = {
  '1': {
    name: 'Amar Akbar Anthony',
    shortName: 'AAA',
    eventId: '3056',
    videoUrl1: 'https://jmdapi.com/tablevideo/?id=3056',
    minStake: 10,
    maxStake: 5000
  },
  '2': {
    name: 'Andar Bahar 20',
    shortName: 'AB20',
    eventId: '3031',
    videoUrl1: 'https://jmdapi.com/tablevideo/?id=3031',
    minStake: 5,
    maxStake: 1000
  },
  '3': {
    name: 'Card 32 EU',
    shortName: 'Card32EU',
    eventId: '3033',
    videoUrl1: 'https://jmdapi.com/tablevideo/?id=3033',
    minStake: 25,
    maxStake: 10000
  },
  '4': {
    name: 'Dragon Tiger 20',
    shortName: 'DT20',
    eventId: '3034',
    videoUrl1: 'https://jmdapi.com/tablevideo/?id=3034',
    minStake: 50,
    maxStake: 25000
  },
  '5': {
    name: 'Lucky 7 EU',
    shortName: 'Lucky7EU',
    eventId: '3032',
    videoUrl1: 'https://jmdapi.com/tablevideo/?id=3032',
    minStake: 100,
    maxStake: 50000
  },
  '6': {
    name: '20-20 Teenpatti',
    shortName: 'Teen20',
    eventId: '3030',
    videoUrl1: 'https://jmdapi.com/tablevideo/?id=3030',
    minStake: 20,
    maxStake: 20000
  }
};

const CasinoUpdatePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [casinoData, setCasinoData] = useState<CasinoData>({
    name: '',
    shortName: '',
    eventId: id as string || '',
    videoUrl1: '',
    minStake: 0,
    maxStake: 0,
    betStatus: true,
    casinoStatus: true,
    errorMessage: 'Game is under maintenance',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCasinoData(id as string);
    }
  }, [id]);

  const loadCasinoData = async (casinoId: string) => {
    try {
      const response = await fetch(`https://operate.3xbat.com/api/casino/games/${casinoId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const game = result.data;
        setCasinoData({
          name: game.name,
          shortName: game.shortName,
          eventId: game.eventId,
          videoUrl1: game.videoUrl1,
          minStake: game.minStake,
          maxStake: game.maxStake,
          betStatus: game.betStatus,
          casinoStatus: game.casinoStatus,
          errorMessage: game.errorMessage || 'Game is under maintenance',
        });
      } else {
        // Fallback to static data if API fails
        const game = casinoGames[casinoId as keyof typeof casinoGames];
        if (game) {
          setCasinoData({
            name: game.name,
            shortName: game.shortName,
            eventId: game.eventId,
            videoUrl1: game.videoUrl1,
            minStake: game.minStake,
            maxStake: game.maxStake,
            betStatus: true,
            casinoStatus: true,
            errorMessage: 'Game is under maintenance',
          });
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading casino data:', error);
      // Fallback to static data
      const game = casinoGames[casinoId as keyof typeof casinoGames];
      if (game) {
        setCasinoData({
          name: game.name,
          shortName: game.shortName,
          eventId: game.eventId,
          videoUrl1: game.videoUrl1,
          minStake: game.minStake,
          maxStake: game.maxStake,
          betStatus: true,
          casinoStatus: true,
          errorMessage: 'Game is under maintenance',
        });
      }
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CasinoData, value: string | boolean | number) => {
    setCasinoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://operate.3xbat.com/api/casino/games/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(casinoData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Casino game updated successfully!');
        console.log('Casino data updated:', result.data);
      } else {
        alert('Failed to update casino game: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating casino data:', error);
      alert('Error updating casino game. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading casino data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!casinoGames[id as string]) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h1>
            <p className="text-gray-600 mb-4">The requested casino game could not be found.</p>
            <button
              onClick={handleBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Casino</h1>
            <p className="text-sm text-gray-600">Manage casino game details, settings, and configurations</p>
          </div>
          <button 
            onClick={handleBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Casino Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Main Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Name</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="name" 
                  disabled
                  value={casinoData.name}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Short Name</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="shortName" 
                  disabled
                  value={casinoData.shortName}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Event ID</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="eventId" 
                  value={casinoData.eventId}
                  onChange={(e) => handleInputChange('eventId', e.target.value)}
                />
              </div>


              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Video URL 1</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="videoUrl1" 
                  value={casinoData.videoUrl1}
                  onChange={(e) => handleInputChange('videoUrl1', e.target.value)}
                />
              </div>


              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Min Stake</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="minStake" 
                  value={casinoData.minStake}
                  onChange={(e) => handleInputChange('minStake', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Max Stake</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="maxStake" 
                  value={casinoData.maxStake}
                  onChange={(e) => handleInputChange('maxStake', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Status Toggles */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <label className="text-sm font-medium text-gray-700">Bet Status</label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={casinoData.betStatus}
                    onChange={(e) => handleInputChange('betStatus', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <label className="text-sm font-medium text-gray-700">Casino Status</label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={casinoData.casinoStatus}
                    onChange={(e) => handleInputChange('casinoStatus', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>

            {/* Settings Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">Error Message</label>
                  <input 
                    className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="text" 
                    name="errorMessage" 
                    value={casinoData.errorMessage}
                    onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                  />
                </div>

              </div>
            </div>

            {/* Odds Setting Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center bg-blue-600 rounded px-3 py-2">
                <div className="text-white text-sm font-medium">Odds Setting</div>
                <button type="button" className="text-white hover:text-gray-200 focus:outline-none">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 pb-4 space-x-3">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded transition-colors"
              >
                Submit
              </button>
            </div>

            {/* Video Preview */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Stream Preview</h3>
              <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={casinoData.videoUrl1}
                  title={`${casinoData.name} Live Stream`}
                  className="w-full h-64"
                  allowFullScreen
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default CasinoUpdatePage;

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}
