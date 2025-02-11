import { MatchData } from "@/contexts/MatchContext";

interface MatchDisplayProps {
  team1: string;
  team2: string;
  servingTeam: string;
  isServingTeam1: boolean;
  courtNumber: number;
}

export default function MatchDisplay({
  team1,
  team2,
  servingTeam,
  isServingTeam1,
  courtNumber
}: MatchDisplayProps) {
  const defaultTeam1 = courtNumber === 1 ? 'Team A' : 'Team C';
  const defaultTeam2 = courtNumber === 1 ? 'Team B' : 'Team D';

  return (
    <div className="teams">
      <div className="team team1">
        <h2>{team1 || defaultTeam1}</h2>
        <p>{isServingTeam1 ? 'Current Serve' : 'Receiving'}</p>
      </div>
      <div className="vs">VS</div>
      <div className="team team2">
        <h2>{team2 || defaultTeam2}</h2>
        <p>{!isServingTeam1 ? 'Current Serve' : 'Receiving'}</p>
      </div>
    </div>
  );
}
