import type { NextApiRequest, NextApiResponse } from 'next';
import RealExternalAPIService from '../../external-apis/RealExternalAPIService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'eventId parameter is required' 
      });
    }

    const apiService = new RealExternalAPIService();
    
    // Fetch odds data to get available market types
    const oddsData = await apiService.getCricketOdds(eventId as string);
    
    // Extract market types from the odds data
    const marketTypes = extractMarketTypes(oddsData);
    
    return res.status(200).json({
      success: true,
      data: {
        eventId,
        marketTypes,
        totalMarkets: marketTypes.length
      }
    });

  } catch (error) {
    console.error('Error fetching market types:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function extractMarketTypes(oddsData: any): Array<{key: string, label: string, enabled: boolean}> {
  const marketTypes: Array<{key: string, label: string, enabled: boolean}> = [];
  
  // Default market types that are commonly available
  const defaultMarkets = [
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
  ];

  // If we have actual odds data, try to extract market names from it
  if (oddsData && oddsData.data) {
    try {
      // Look for market names in the odds data structure
      const markets = new Set<string>();
      
      if (Array.isArray(oddsData.data)) {
        oddsData.data.forEach((market: any) => {
          if (market.mname || market.marketName || market.name) {
            const marketName = market.mname || market.marketName || market.name;
            markets.add(marketName);
          }
        });
      } else if (oddsData.data.markets) {
        oddsData.data.markets.forEach((market: any) => {
          if (market.mname || market.marketName || market.name) {
            const marketName = market.mname || market.marketName || market.name;
            markets.add(marketName);
          }
        });
      }

      // Convert found markets to our format
      Array.from(markets).forEach((marketName, index) => {
        marketTypes.push({
          key: `market_${index}`,
          label: marketName,
          enabled: true
        });
      });
    } catch (error) {
      console.error('Error extracting market types from odds data:', error);
    }
  }

  // If no markets were found in the data, return default markets
  if (marketTypes.length === 0) {
    return defaultMarkets;
  }

  return marketTypes;
}
