import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

interface MatchData {
  matchName: string;
  seriesName: string;
  scoreIframe: string;
  scoreIframe2: string;
  eventId: string;
  seriesId: string;
  sportId: string;
  marketId: string;
  priority: string;
  matchDate: string;
  tvId: string;
  socketUrl: string;
  cacheUrl: string;
  otherMarketCacheUrl: string;
  tvUrl: string;
  matchType: string;
  status: string;
  betDelayTime: string;
  bookmakerRange: string;
  team1Img: string;
  team2Img: string;
  notification: string;
  wonTeamName: string;
  // Bet Delay Settings
  tieBetDelay: string;
  bookmakerBetDelay: string;
  tossBetDelay: string;
  completedBetDelay: string;
  matchOddsBetDelay: string;
  // Permissions
  isTv: boolean;
  isScore: boolean;
  betPerm: boolean;
  socketPerm: boolean;
  isBookmaker: boolean;
  isFancy: boolean;
  isMatchOdds: boolean;
  isTieOdds: boolean;
  isToss: boolean;
  isCompletedOdds: boolean;
  isLineMarketOdds: boolean;
}

const MatchUpdatePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [matchData, setMatchData] = useState<MatchData>({
    matchName: '',
    seriesName: '',
    scoreIframe: '',
    scoreIframe2: '',
    eventId: id as string || '',
    seriesId: '',
    sportId: '4',
    marketId: '',
    priority: '',
    matchDate: '',
    tvId: '',
    socketUrl: 'https://vigcache.trovetown.co/',
    cacheUrl: '',
    otherMarketCacheUrl: '',
    tvUrl: '',
    matchType: '',
    status: 'UPCOMING',
    betDelayTime: '',
    bookmakerRange: '',
    team1Img: '',
    team2Img: '',
    notification: '',
    wonTeamName: '',
    // Bet Delay Settings
    tieBetDelay: '0',
    bookmakerBetDelay: '0',
    tossBetDelay: '0',
    completedBetDelay: '0',
    matchOddsBetDelay: '1',
    // Permissions
    isTv: true,
    isScore: true,
    betPerm: true,
    socketPerm: true,
    isBookmaker: true,
    isFancy: true,
    isMatchOdds: true,
    isTieOdds: true,
    isToss: true,
    isCompletedOdds: true,
    isLineMarketOdds: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [marketTypes, setMarketTypes] = useState<Array<{key: string, label: string, enabled: boolean}>>([]);
  const [expandedSections, setExpandedSections] = useState({
    matchDetails: true,
    betStakeSetting: false,
    betDelaySetting: false,
    permissions: false,
    otherMarkets: false
  });

  useEffect(() => {
    if (id) {
      // Load match data based on ID
      loadMatchData(id as string);
    }
  }, [id]);

  const loadMatchData = async (matchId: string) => {
    try {
      // Fetch market types from backend
      await loadMarketTypes(matchId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading match data:', error);
      setIsLoading(false);
    }
  };

  const loadMarketTypes = async (eventId: string) => {
    try {
      const response = await fetch(`https://control.3xbat.com/api/matches/market-types?eventId=${eventId}`);
      const data = await response.json();
      
      if (data.success && data.data.marketTypes) {
        setMarketTypes(data.data.marketTypes);
      } else {
        // Fallback to default market types if API fails
        setMarketTypes([
          { key: 'isMatchOdds', label: 'Match Odds', enabled: true },
          { key: 'isFancy', label: 'Fancy', enabled: true },
          { key: 'isTieOdds', label: 'Tie Odds', enabled: true },
          { key: 'isToss', label: 'Toss', enabled: true },
          { key: 'isCompletedOdds', label: 'Completed Odds', enabled: true },
          { key: 'isLineMarketOdds', label: 'Line Market', enabled: true },
          { key: 'isBookmaker', label: 'Bookmaker', enabled: true },
          { key: 'isTv', label: 'TV Stream', enabled: true },
          { key: 'isScore', label: 'Score', enabled: true },
          { key: 'betPerm', label: 'Betting', enabled: true },
          { key: 'socketPerm', label: 'Socket', enabled: true }
        ]);
      }
    } catch (error) {
      console.error('Error loading market types:', error);
      // Set default market types on error
      setMarketTypes([
        { key: 'isMatchOdds', label: 'Match Odds', enabled: true },
        { key: 'isFancy', label: 'Fancy', enabled: true },
        { key: 'isTieOdds', label: 'Tie Odds', enabled: true },
        { key: 'isToss', label: 'Toss', enabled: true },
        { key: 'isCompletedOdds', label: 'Completed Odds', enabled: true },
        { key: 'isLineMarketOdds', label: 'Line Market', enabled: true },
        { key: 'isBookmaker', label: 'Bookmaker', enabled: true },
        { key: 'isTv', label: 'TV Stream', enabled: true },
        { key: 'isScore', label: 'Score', enabled: true },
        { key: 'betPerm', label: 'Betting', enabled: true },
        { key: 'socketPerm', label: 'Socket', enabled: true }
      ]);
    }
  };

  const handleInputChange = (field: keyof MatchData, value: string | boolean) => {
    setMatchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting match data:', matchData);
    // Handle form submission
  };

  const handleBack = () => {
    router.back();
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading match data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Update Match</h1>
            <p className="text-sm text-gray-600">Manage match details, settings, and permissions</p>
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
          <form onSubmit={handleSubmit}>
            {/* Match Details Section */}
            <div className="border-b border-gray-200">
              <div 
                className="flex justify-between items-center bg-blue-600 rounded px-3 py-2 cursor-pointer"
                onClick={() => toggleSection('matchDetails')}
              >
                <div className="text-white text-sm font-medium">Match Details</div>
                <button 
                  className="text-white hover:text-gray-200 p-1" 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('matchDetails');
                  }}
                >
                  <svg 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform ${expandedSections.matchDetails ? 'rotate-45' : ''}`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              {expandedSections.matchDetails && (
                <div className="p-4">
                  {/* Main Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Match Name</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="matchName" 
                  value={matchData.matchName}
                  onChange={(e) => handleInputChange('matchName', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Series Name</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="seriesName" 
                  value={matchData.seriesName}
                  onChange={(e) => handleInputChange('seriesName', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Event ID</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="eventId" 
                  value={matchData.eventId}
                  onChange={(e) => handleInputChange('eventId', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Series ID</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="seriesId" 
                  value={matchData.seriesId}
                  onChange={(e) => handleInputChange('seriesId', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Sport ID</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="sportId" 
                  value={matchData.sportId}
                  onChange={(e) => handleInputChange('sportId', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Market ID</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="marketId" 
                  value={matchData.marketId}
                  onChange={(e) => handleInputChange('marketId', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Priority</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="priority" 
                  value={matchData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Match Date</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="matchDate" 
                  value={matchData.matchDate}
                  onChange={(e) => handleInputChange('matchDate', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">TV ID</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="tvId" 
                  value={matchData.tvId}
                  onChange={(e) => handleInputChange('tvId', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Socket URL</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="socketUrl" 
                  value={matchData.socketUrl}
                  onChange={(e) => handleInputChange('socketUrl', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Cache URL</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="cacheUrl" 
                  value={matchData.cacheUrl}
                  onChange={(e) => handleInputChange('cacheUrl', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Other Market Cache URL</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="otherMarketCacheUrl" 
                  value={matchData.otherMarketCacheUrl}
                  onChange={(e) => handleInputChange('otherMarketCacheUrl', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">TV URL</label>
                <div className="flex space-x-2">
                  <input 
                    className="flex-1 p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="text" 
                    name="tvUrl" 
                    value={matchData.tvUrl}
                    onChange={(e) => handleInputChange('tvUrl', e.target.value)}
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs rounded transition-colors" type="button">Set URL</button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Match Type</label>
                <select 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="matchType"
                  value={matchData.matchType}
                  onChange={(e) => handleInputChange('matchType', e.target.value)}
                >
                  <option>Select Match Type</option>
                  <option value="One-Day">One Day</option>
                  <option value="T-20">T 20</option>
                  <option value="T-10">T 10</option>
                  <option value="Test">Test</option>
                  <option value="Cup">Cup</option>
                  <option value="20-20 OR 50-50">SA20</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Status</label>
                <select 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="status"
                  value={matchData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="INPLAY">Inplay</option>
                  <option value="ABONDED">Abandoned</option>
                  <option value="REMOVE">Remove</option>
                  <option value="CANCEL">Cancel</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="UPCOMING">Upcoming</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Bet Delay Time</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="betDelayTime" 
                  value={matchData.betDelayTime}
                  onChange={(e) => handleInputChange('betDelayTime', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Bookmaker Range</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="bookmakerRange" 
                  value={matchData.bookmakerRange}
                  onChange={(e) => handleInputChange('bookmakerRange', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Team 1 Image</label>
                <div className="flex space-x-2">
                  <input 
                    className="flex-1 p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="file" 
                    name="team1Img"
                    onChange={(e) => handleInputChange('team1Img', e.target.files?.[0]?.name || '')}
                  />
                  {matchData.team1Img && <img alt="team1Img" className="h-12 w-24 rounded object-cover" src={matchData.team1Img} />}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Team 2 Image</label>
                <div className="flex space-x-2">
                  <input 
                    className="flex-1 p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="file" 
                    name="team2Img"
                    onChange={(e) => handleInputChange('team2Img', e.target.files?.[0]?.name || '')}
                  />
                  {matchData.team2Img && <img alt="team2Img" className="h-12 w-24 rounded object-cover" src={matchData.team2Img} />}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Notification</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="text" 
                  name="notification" 
                  value={matchData.notification}
                  onChange={(e) => handleInputChange('notification', e.target.value)}
                />
                  </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bet Stake Setting Section */}
            <div className="border-b border-gray-200">
              <div 
                className="flex justify-between items-center bg-blue-600 rounded px-3 py-2 cursor-pointer"
                onClick={() => toggleSection('betStakeSetting')}
              >
                <div className="text-white text-sm font-medium">Bet Stake Setting</div>
                <button 
                  className="text-white hover:text-gray-200 p-1" 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('betStakeSetting');
                  }}
                >
                  <svg 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform ${expandedSections.betStakeSetting ? 'rotate-45' : ''}`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              {expandedSections.betStakeSetting && (
                <div className="p-4">
                  <div className="text-gray-600 text-sm">Bet stake configuration options will be displayed here.</div>
                </div>
              )}
            </div>

            {/* Bet Delay Setting Section */}
            <div className="border-b border-gray-200">
              <div 
                className="flex justify-between items-center bg-blue-600 rounded px-3 py-2 cursor-pointer"
                onClick={() => toggleSection('betDelaySetting')}
              >
                <div className="text-white text-sm font-medium">Bet Delay Setting</div>
                <button 
                  className="text-white hover:text-gray-200 p-1" 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('betDelaySetting');
                  }}
                >
                  <svg 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform ${expandedSections.betDelaySetting ? 'rotate-45' : ''}`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              {expandedSections.betDelaySetting && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Tie Bet Delay</label>
                        <input 
                          className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="number" 
                          name="tieBetDelay" 
                          value={matchData.tieBetDelay}
                          onChange={(e) => handleInputChange('tieBetDelay', e.target.value)}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Bookmaker Bet Delay</label>
                        <input 
                          className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="number" 
                          name="bookmakerBetDelay" 
                          value={matchData.bookmakerBetDelay}
                          onChange={(e) => handleInputChange('bookmakerBetDelay', e.target.value)}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Toss Bet Delay</label>
                        <input 
                          className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="number" 
                          name="tossBetDelay" 
                          value={matchData.tossBetDelay}
                          onChange={(e) => handleInputChange('tossBetDelay', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Completed Bet Delay</label>
                        <input 
                          className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="number" 
                          name="completedBetDelay" 
                          value={matchData.completedBetDelay}
                          onChange={(e) => handleInputChange('completedBetDelay', e.target.value)}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">MatchOdds Bet Delay</label>
                        <input 
                          className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="number" 
                          name="matchOddsBetDelay" 
                          value={matchData.matchOddsBetDelay}
                          onChange={(e) => handleInputChange('matchOddsBetDelay', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Permissions Section */}
            <div className="border-b border-gray-200">
              <div 
                className="flex justify-between items-center bg-blue-600 rounded px-3 py-2 cursor-pointer"
                onClick={() => toggleSection('permissions')}
              >
                <div className="text-white text-sm font-medium">Permissions</div>
                <button 
                  className="text-white hover:text-gray-200 p-1" 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('permissions');
                  }}
                >
                  <svg 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform ${expandedSections.permissions ? 'rotate-45' : ''}`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              {expandedSections.permissions && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketTypes.map(({ key, label, enabled }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={enabled}
                        onChange={(e) => {
                          // Update the market types state
                          setMarketTypes(prev => 
                            prev.map(market => 
                              market.key === key 
                                ? { ...market, enabled: e.target.checked }
                                : market
                            )
                          );
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded transition-colors" type="button">Clear Exposer</button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded transition-colors" type="button">Update BetFair Market</button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded transition-colors" type="button">Check Duplicate Fancy</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded transition-colors" type="button">Check Duplicate Exposer Fancy</button>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded transition-colors" type="submit">Submit</button>
            </div>

            {/* Won Team */}
            <div className="mt-6">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Won Team Name</label>
                <input 
                  className="w-full p-2 text-sm text-gray-900 border border-gray-300 rounded bg-gray-100"
                  type="text" 
                  name="wonTeamName" 
                  disabled
                  value={matchData.wonTeamName}
                />
              </div>
            </div>

            {/* Other Market Tables Section */}
            <div className="border-b border-gray-200">
              <div 
                className="flex justify-between items-center bg-blue-600 rounded px-3 py-2 cursor-pointer"
                onClick={() => toggleSection('otherMarkets')}
              >
                <div className="text-white text-sm font-medium">Other Market</div>
                <button 
                  className="text-white hover:text-gray-200 p-1" 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('otherMarkets');
                  }}
                >
                  <svg 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform ${expandedSections.otherMarkets ? 'rotate-45' : ''}`}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              
              {expandedSections.otherMarkets && (
                <div className="p-4">
                  <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">BetFair Market ID</th>
                        <th className="px-4 py-2 text-left">Market Type</th>
                        <th className="px-4 py-2 text-left">Match Name</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No data available</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Team Name</th>
                        <th className="px-4 py-2 text-left">Selection ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">No data available</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default MatchUpdatePage;
