// Card mapping utility for playing-cards-standard-deck
// Maps API card values to the correct SVG file names

export interface CardValue {
  rank: string;
  suit: string;
}

export const parseCardValue = (cardValue: string): CardValue | null => {
  if (cardValue === '1') {
    return null; // Face down card
  }
  
  // Parse card values like "10DD", "QHH", "AS", etc.
  const match = cardValue.match(/^([0-9JQKA]+)([CDHS]+)$/);
  if (!match) {
    return null;
  }
  
  const [, rank, suit] = match;
  
  // Map suits
  const suitMap: { [key: string]: string } = {
    'C': 'c', // Clubs
    'D': 'd', // Diamonds  
    'H': 'h', // Hearts
    'S': 's'  // Spades
  };
  
  // Map ranks
  const rankMap: { [key: string]: string } = {
    'A': '1',   // Ace
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': '11',  // Jack
    'Q': '12',  // Queen
    'K': '13'   // King
  };
  
  const mappedSuit = suitMap[suit];
  const mappedRank = rankMap[rank];
  
  if (!mappedSuit || !mappedRank) {
    return null;
  }
  
  return {
    rank: mappedRank,
    suit: mappedSuit
  };
};

export const getCardFileName = (cardValue: string): string => {
  const parsed = parseCardValue(cardValue);
  if (!parsed) {
    return '1c'; // Default face down card
  }
  
  return `${parsed.rank}${parsed.suit}`;
};

export const getCardPath = (cardValue: string): string => {
  const fileName = getCardFileName(cardValue);
  return `/node_modules/@younestouati/playing-cards-standard-deck/cards/${fileName}.svg`;
};

