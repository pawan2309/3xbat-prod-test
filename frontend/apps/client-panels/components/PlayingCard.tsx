import React, { useState } from 'react';
import { parseCardValue } from '@/lib/utils/cardMapper';

interface PlayingCardProps {
  cardValue: string;
  className?: string;
  alt?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ 
  cardValue, 
  className = "w-[24px] h-[35px]", 
  alt = "playing card" 
}) => {
  const [imageError, setImageError] = useState(false);
  const isFaceDown = cardValue === '1';
  
  if (isFaceDown || imageError) {
    // Show a simple face-down card
    return (
      <div className={`${className} bg-gradient-to-br from-blue-600 to-blue-800 rounded border-2 border-white flex items-center justify-center`}>
        <div className="text-white text-xs font-bold">?</div>
      </div>
    );
  }
  
  // Parse the card value to get rank and suit
  const parsedCard = parseCardValue(cardValue);
  
  if (!parsedCard) {
    // Fallback to face-down card if parsing fails
    return (
      <div className={`${className} bg-gradient-to-br from-blue-600 to-blue-800 rounded border-2 border-white flex items-center justify-center`}>
        <div className="text-white text-xs font-bold">?</div>
      </div>
    );
  }
  
  // Generate a simple card representation
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'h': return '♥';
      case 'd': return '♦';
      case 'c': return '♣';
      case 's': return '♠';
      default: return '?';
    }
  };
  
  const getSuitColor = (suit: string) => {
    return suit === 'h' || suit === 'd' ? 'text-red-600' : 'text-black';
  };
  
  const getDisplayRank = (rank: string) => {
    switch (rank) {
      case '1': return 'A';
      case '11': return 'J';
      case '12': return 'Q';
      case '13': return 'K';
      default: return rank;
    }
  };
  
  return (
    <div className={`${className} bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center text-xs font-bold`}>
      <div className={`${getSuitColor(parsedCard.suit)} text-[8px]`}>
        {getDisplayRank(parsedCard.rank)}
      </div>
      <div className={`${getSuitColor(parsedCard.suit)} text-[6px]`}>
        {getSuitSymbol(parsedCard.suit)}
      </div>
    </div>
  );
};

