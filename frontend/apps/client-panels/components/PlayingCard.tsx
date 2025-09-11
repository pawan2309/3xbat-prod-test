import React from 'react';
import { getCardPath } from '@/lib/utils/cardMapper';

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
  const isFaceDown = cardValue === '1';
  
  if (isFaceDown) {
    // Show a simple face-down card
    return (
      <div className={`${className} bg-gradient-to-br from-blue-600 to-blue-800 rounded border-2 border-white flex items-center justify-center`}>
        <div className="text-white text-xs font-bold">?</div>
      </div>
    );
  }
  
  const cardPath = getCardPath(cardValue);
  
  return (
    <img 
      src={cardPath}
      alt={alt}
      className={className}
      style={{
        // Force the simplified style (like the 20px version)
        maxWidth: '24px',
        maxHeight: '35px',
        objectFit: 'contain'
      }}
      onError={(e) => {
        // Fallback to face-down card if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="${className} bg-gradient-to-br from-blue-600 to-blue-800 rounded border-2 border-white flex items-center justify-center">
              <div class="text-white text-xs font-bold">?</div>
            </div>
          `;
        }
      }}
    />
  );
};

