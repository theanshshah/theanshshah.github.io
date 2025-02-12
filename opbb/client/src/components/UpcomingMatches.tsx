import React from 'react';
import { useMatchData } from '../context/SocketContext';

const UpcomingMatches: React.FC = () => {
  const { matchData } = useMatchData();

  return (
    <div className="schedule">
      <h2>Today's Matches</h2>
      <div className="match-list">
        {matchData.upcoming.map((match, index) => (
          <div key={index} className="match-item">
            <span>{match.team1} vs {match.team2}</span>
            <span>{match.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMatches;
