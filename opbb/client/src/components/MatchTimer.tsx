import React from 'react';
import { useMatchTimer } from '../hooks/useMatchTimer';

interface MatchTimerProps {
  timeRemaining: number;
  status: 'paused' | 'live' | 'completed';
}

const MatchTimer: React.FC<MatchTimerProps> = ({ timeRemaining, status }) => {
  const { displayTime } = useMatchTimer(timeRemaining, status);

  return (
    <div className={`match-timer ${status === 'live' ? 'animate-pulse' : ''}`}>
      ⏱️ {displayTime}
    </div>
  );
};

export default MatchTimer;