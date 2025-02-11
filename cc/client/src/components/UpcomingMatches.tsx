interface UpcomingMatch {
  team1: string;
  team2: string;
  time: string;
  court: string;
}

interface UpcomingMatchesProps {
  matches: UpcomingMatch[];
}

export default function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  // Group matches by court
  const matchesByCourt: Record<string, UpcomingMatch[]> = {
    '1': [],
    '2': []
  };

  matches.forEach(match => {
    matchesByCourt[match.court].push(match);
  });

  return (
    <div className="schedule">
      <h2>Today's Matches</h2>
      {Object.entries(matchesByCourt).map(([courtNumber, courtMatches]) => (
        <div key={courtNumber} className="court-section">
          <div className="court-number">Court {courtNumber}</div>
          <ul className="match-list">
            {courtMatches.map((match, idx) => (
              <li key={idx} className="match-item">
                <span>
                  {match.team1 || 'TBD'} vs {match.team2 || 'TBD'}
                </span>
                <span>{match.time || 'TBD'}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {matches.length === 0 && (
        <div className="no-matches">
          No upcoming matches scheduled
        </div>
      )}
    </div>
  );
}
