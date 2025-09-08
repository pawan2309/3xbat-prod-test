'use client';

interface BallByBallProps {
  balls: string[];
  ballRunningStatus: string;
}

export default function BallByBall({ balls, ballRunningStatus }: BallByBallProps) {
  const getBallColor = (ball: string) => {
    if (ball === '0') return 'bg-gray-200 text-gray-800'; // Dot ball
    if (ball === '1') return 'bg-blue-100 text-blue-800'; // Single
    if (ball === '2') return 'bg-green-100 text-green-800'; // Double
    if (ball === '3') return 'bg-yellow-100 text-yellow-800'; // Triple
    if (ball === '4') return 'bg-orange-100 text-orange-800'; // Four
    if (ball === '6') return 'bg-red-100 text-red-800'; // Six
    if (ball === 'W') return 'bg-red-200 text-red-800'; // Wicket
    if (ball === 'WD') return 'bg-purple-100 text-purple-800'; // Wide
    if (ball === 'NB') return 'bg-pink-100 text-pink-800'; // No Ball
    if (ball === 'LB') return 'bg-indigo-100 text-indigo-800'; // Leg Bye
    if (ball === 'B') return 'bg-teal-100 text-teal-800'; // Bye
    return 'bg-gray-100 text-gray-600'; // Default
  };

  const getBallSymbol = (ball: string) => {
    if (ball === '0') return '•';
    if (ball === 'W') return 'W';
    if (ball === 'WD') return 'WD';
    if (ball === 'NB') return 'NB';
    if (ball === 'LB') return 'LB';
    if (ball === 'B') return 'B';
    return ball;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Ball by Ball</h3>
        {ballRunningStatus && (
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-600">
              {ballRunningStatus.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-600">Last 6:</span>
        <div className="flex space-x-1">
          {balls.map((ball, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                getBallColor(ball)
              } ${
                index === balls.length - 1 && ballRunningStatus 
                  ? 'ring-1 ring-red-400 ring-opacity-50' 
                  : ''
              }`}
            >
              {getBallSymbol(ball)}
            </div>
          ))}
        </div>
      </div>

      {/* Compact Ball Legend */}
      <div className="mt-3 grid grid-cols-4 gap-1 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 rounded-full flex items-center justify-center text-xs">•</div>
          <span>Dot</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-100 rounded-full flex items-center justify-center text-xs">4</div>
          <span>Four</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 rounded-full flex items-center justify-center text-xs">6</div>
          <span>Six</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-200 rounded-full flex items-center justify-center text-xs">W</div>
          <span>Wicket</span>
        </div>
      </div>
    </div>
  );
}
