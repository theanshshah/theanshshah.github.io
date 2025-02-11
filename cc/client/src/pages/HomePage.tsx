import CourtSection from "@/components/CourtSection";
import { useSocket } from "@/contexts/SocketContext";
import { useMatch } from "@/contexts/MatchContext";
import { Link } from "wouter";

export default function HomePage() {
  const { matchData } = useMatch();

  return (
    <>
      <div className="header">
        <div className="container">
          <h1 className="title">🥒 Pickleball Pro Matches</h1>
          <div className="live-badge">LIVE NOW</div>
          <Link href="/admin" className="admin-link">Admin Panel ⚙️</Link>
        </div>
      </div>

      <div className="container">
        <div id="displaySection">
          <CourtSection 
            courtNumber={1} 
            data={matchData.court1}
          />
          <CourtSection 
            courtNumber={2}
            data={matchData.court2}
          />

          <div className="next-up">
            <h3>Next Up: <span>{matchData.nextMatch || "Upcoming Match"}</span> 🏓</h3>
          </div>

          <div className="schedule">
            <h2>Today's Matches</h2>
            <div className="match-list">
              {matchData.upcoming?.map((match, idx) => (
                <div key={idx} className="match-item">
                  <span>{match.team1} vs {match.team2}</span>
                  <span>{match.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="made-by">
        Made with ❤️ by Ansh
      </footer>
    </>
  );
}