'use client';

interface ScorecardDisplayProps {
  data?: {
    spnnation1: string;
    spnnation2: string;
    score1: string;
    score2: string;
    spnrunrate1: string;
    spnrunrate2: string;
    spnreqrate1: string;
    spnreqrate2: string;
    activenation1: string;
    activenation2: string;
    isfinished: string;
    balls: string[];
    spnballrunningstatus: string;
    dayno: string;
    spnmessage: string;
  };
  matchEname?: string;
}

export default function ScorecardDisplay({ data, matchEname }: ScorecardDisplayProps) {
  // Extract team names from match.ename if available
  const teamNames = matchEname ? matchEname.split(' v ') : ['Team 1', 'Team 2'];
  
  // Add null checks and fallbacks for all data properties
  const safeData = {
    spnnation1: data?.spnnation1 || teamNames[0] || 'Team 1',
    spnnation2: data?.spnnation2 || teamNames[1] || 'Team 2',
    score1: data?.score1 || '0/0',
    score2: data?.score2 || '0/0',
    spnrunrate1: data?.spnrunrate1 || '0.00',
    spnrunrate2: data?.spnrunrate2 || '0.00',
    spnreqrate1: data?.spnreqrate1 || '0.00',
    spnreqrate2: data?.spnreqrate2 || '0.00',
    activenation1: data?.activenation1 || '0',
    activenation2: data?.activenation2 || '0',
    isfinished: data?.isfinished || '0',
    balls: data?.balls || ['0', '0', '0', '0', '0', '0'],
    spnballrunningstatus: data?.spnballrunningstatus || '',
    dayno: data?.dayno || '1',
    spnmessage: data?.spnmessage || ''
  };

  const isTeam1Active = safeData.activenation1 === "1";
  const isTeam2Active = safeData.activenation2 === "1";
  const isFinished = safeData.isfinished === "1";

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
    <div className="bg-white rounded-lg shadow-md w-full">
      {/* Compact Single Card Layout */}
      <div className="p-3">
        {/* Header Row with Day and Status */}
        <div className="flex items-center justify-center mb-3">
          <div className="text-xs text-gray-500 mr-2">Day {safeData.dayno}</div>
          {isFinished ? (
            <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
              FINISHED
            </div>
          ) : (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium animate-pulse">
              LIVE
            </div>
          )}
        </div>

        {/* Teams and Scores Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Left Team */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isTeam1Active && !isFinished ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <h3 className={`text-sm font-bold truncate ${
                isTeam1Active && !isFinished ? 'text-green-800' : 'text-gray-800'
              }`}>
                {safeData.spnnation1}
              </h3>
              {isTeam1Active && !isFinished && (
                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs flex-shrink-0">
                  BAT
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-gray-800">{safeData.score1}</div>
            {safeData.spnrunrate1 && (
              <div className="text-xs text-gray-600">RR: {safeData.spnrunrate1}</div>
            )}
          </div>

          {/* Center Ball by Ball */}
          <div className="flex-1 text-center px-2 min-w-0">
            <div className="text-xs text-gray-600 mb-1">Last 6:</div>
            <div className="flex justify-center space-x-1 flex-wrap">
              {safeData.balls.map((ball, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                    getBallColor(ball)
                  } ${
                    index === safeData.balls.length - 1 && safeData.spnballrunningstatus 
                      ? 'ring-1 ring-red-400 ring-opacity-50' 
                      : ''
                  }`}
                >
                  {getBallSymbol(ball)}
                </div>
              ))}
            </div>
            {safeData.spnballrunningstatus && (
              <div className="flex items-center justify-center space-x-1 mt-1">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">
                  {safeData.spnballrunningstatus.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Right Team */}
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-center justify-end space-x-2 mb-1">
              {isTeam2Active && !isFinished && (
                <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs flex-shrink-0">
                  BAT
                </span>
              )}
              <h3 className={`text-sm font-bold truncate ${
                isTeam2Active && !isFinished ? 'text-green-800' : 'text-gray-800'
              }`}>
                {safeData.spnnation2}
              </h3>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isTeam2Active && !isFinished ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className="text-lg font-bold text-gray-800">{safeData.score2}</div>
            {safeData.spnrunrate2 && (
              <div className="text-xs text-gray-600">RR: {safeData.spnrunrate2}</div>
            )}
          </div>
        </div>

        {/* Match Message */}
        {safeData.spnmessage && (
          <div className="mt-2 bg-yellow-50 border-l-2 border-yellow-400 px-2 py-1 rounded-r">
            <p className="text-yellow-800 text-xs font-medium break-words">{safeData.spnmessage}</p>
          </div>
        )}

        {/* Required Run Rate */}
        {(safeData.spnreqrate1 || safeData.spnreqrate2) && (
          <div className="mt-2 text-xs">
            <div className="text-yellow-700 font-medium text-center mb-1">Required RR</div>
            <div className="text-yellow-600 text-center break-words">
              {safeData.spnreqrate1 && (
                <div className="mb-1">
                  <span className="font-medium">{safeData.spnnation1}:</span> {safeData.spnreqrate1}
                </div>
              )}
              {safeData.spnreqrate2 && (
                <div>
                  <span className="font-medium">{safeData.spnnation2}:</span> {safeData.spnreqrate2}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
