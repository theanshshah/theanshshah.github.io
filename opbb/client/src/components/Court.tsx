import React from 'react';
import MatchTimer from './MatchTimer';

interface CourtProps {
  courtNumber: number;
  team1: string;
  team2: string;
  servingTeam: 'team1' | 'team2';
  status: 'paused' | 'live' | 'completed' | 'cancelled';
  timeRemaining: number;
}

const Court: React.FC<CourtProps> = ({
  courtNumber,
  team1,
  team2,
  servingTeam,
  status,
  timeRemaining
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'cancelled':
        return '❌ CANCELLED';
      case 'completed':
        return '✅ COMPLETED';
      case 'live':
        return '🔴 LIVE';
      default:
        return '⏸️ PAUSED';
    }
  };

  return (
    <div className="court-section court-1">
      <div className="court-number">Court {courtNumber} 🏟️</div>
      <div className={`current-match ${status === 'cancelled' ? 'opacity-50' : ''}`}>
        <div className={`match-status-badge ${status}`}>{getStatusDisplay()}</div>
        <MatchTimer timeRemaining={timeRemaining} status={status} />
        <div className="teams">
          <div className={`team team1 ${servingTeam === 'team1' ? 'ring-2 ring-green-500' : ''}`}>
            <h2>{team1 || 'TBD'}</h2>
            <p>{servingTeam === 'team1' ? '🏓 Serving' : 'Receiving'}</p>
          </div>
          <div className="vs">VS</div>
          <div className={`team team2 ${servingTeam === 'team2' ? 'ring-2 ring-green-500' : ''}`}>
            <h2>{team2 || 'TBD'}</h2>
            <p>{servingTeam === 'team2' ? '🏓 Serving' : 'Receiving'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Court;