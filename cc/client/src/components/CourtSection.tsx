import { MatchData } from "@/contexts/MatchContext";
import { useEffect, useState } from "react";

interface CourtSectionProps {
  courtNumber: number;
  data: MatchData;
}

export default function CourtSection({ courtNumber, data }: CourtSectionProps) {
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Add animation when status changes
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [data.status]);

  useEffect(() => {
    // Set urgent status when time is below 60 seconds
    setIsUrgent(data.timeRemaining < 60 && data.status === 'live');
  }, [data.timeRemaining, data.status]);

  return (
    <div className={`court-section court-${courtNumber} ${isAnimating ? 'animate-bounce' : ''}`}>
      <div className="court-number">Court {courtNumber} 🏟️</div>
      <div className={`current-match ${data.status === 'live' ? 'live-match' : ''}`}>
        <div className={`match-status-badge ${data.status}`}>
          {data.status.toUpperCase()}
        </div>
        <div className={`match-timer ${isUrgent ? 'urgent' : ''}`}>
          {formatTime(data.timeRemaining)}
        </div>
        <div className="teams">
          <div className={`team team1 ${data.status === 'live' ? 'active-team' : ''}`}>
            <h2>{data.team1 || `Team ${courtNumber === 1 ? 'A' : 'C'}`}</h2>
          </div>
          <div className="vs">VS</div>
          <div className={`team team2 ${data.status === 'live' ? 'active-team' : ''}`}>
            <h2>{data.team2 || `Team ${courtNumber === 1 ? 'B' : 'D'}`}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}