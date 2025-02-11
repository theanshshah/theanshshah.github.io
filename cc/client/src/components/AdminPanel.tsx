import { useState } from 'react';
import { useMatch } from '@/contexts/MatchContext';
import { useSocket } from '@/contexts/SocketContext';

export default function AdminPanel() {
  const { matchData } = useMatch();
  const { socket } = useSocket();
  const [upcomingMatches, setUpcomingMatches] = useState(matchData.upcoming || []);

  // Auto-update function that triggers whenever form fields change
  const handleFieldChange = async () => {
    const formData = getCurrentFormData();
    try {
      // Send update via Socket.IO for real-time updates
      socket?.emit('match_update', formData);

      // Also send via HTTP for persistence
      await fetch('/api/update-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // No need to show save feedback as it's automatic now
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const addMatchField = () => {
    setUpcomingMatches([
      ...upcomingMatches,
      { team1: '', team2: '', time: '', court: '1' }
    ]);
    handleFieldChange();
  };

  const removeMatch = (index: number) => {
    const newMatches = upcomingMatches.filter((_, i) => i !== index);
    setUpcomingMatches(newMatches);
    handleFieldChange();
  };

  const getCurrentFormData = () => {
    return {
      court1: {
        team1: (document.getElementById('court1team1') as HTMLInputElement).value,
        team2: (document.getElementById('court1team2') as HTMLInputElement).value,
        servingTeam: 'team1',
        status: (document.getElementById('court1status') as HTMLSelectElement).value,
        timeRemaining: matchData.court1.timeRemaining
      },
      court2: {
        team1: (document.getElementById('court2team1') as HTMLInputElement).value,
        team2: (document.getElementById('court2team2') as HTMLInputElement).value,
        servingTeam: 'team1',
        status: (document.getElementById('court2status') as HTMLSelectElement).value,
        timeRemaining: matchData.court2.timeRemaining
      },
      nextMatch: (document.getElementById('nextMatch') as HTMLInputElement).value,
      upcoming: upcomingMatches
    };
  };

  return (
    <div className="admin-panel show">
      <div className="admin-header">🎾 Admin Controls</div>
      <form className="admin-form">
        {/* Court 1 Controls */}
        <div className="court-control">
          <h3>Court 1 Match</h3>
          <div className="form-group">
            <label>Team 1 Name</label>
            <input 
              type="text" 
              id="court1team1" 
              defaultValue={matchData.court1.team1} 
              onChange={handleFieldChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Team 2 Name</label>
            <input 
              type="text" 
              id="court1team2" 
              defaultValue={matchData.court1.team2} 
              onChange={handleFieldChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Match Status</label>
            <select 
              id="court1status" 
              className="match-status" 
              defaultValue={matchData.court1.status}
              onChange={handleFieldChange}
            >
              <option value="paused">Paused</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="timer-display">
            Time Remaining: {formatTime(matchData.court1.timeRemaining)}
          </div>
        </div>

        {/* Court 2 Controls */}
        <div className="court-control">
          <h3>Court 2 Match</h3>
          <div className="form-group">
            <label>Team 1 Name</label>
            <input 
              type="text" 
              id="court2team1" 
              defaultValue={matchData.court2.team1} 
              onChange={handleFieldChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Team 2 Name</label>
            <input 
              type="text" 
              id="court2team2" 
              defaultValue={matchData.court2.team2} 
              onChange={handleFieldChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Match Status</label>
            <select 
              id="court2status" 
              className="match-status" 
              defaultValue={matchData.court2.status}
              onChange={handleFieldChange}
            >
              <option value="paused">Paused</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="timer-display">
            Time Remaining: {formatTime(matchData.court2.timeRemaining)}
          </div>
        </div>

        <div className="form-group">
          <label>Next Match</label>
          <input 
            type="text" 
            id="nextMatch" 
            defaultValue={matchData.nextMatch} 
            onChange={handleFieldChange}
          />
        </div>

        <h3>Upcoming Matches</h3>
        <div id="upcomingMatches">
          {upcomingMatches.map((match, index) => (
            <div key={index} className="match-input-group">
              <input
                type="text"
                placeholder="Team A"
                className="upcoming-team1"
                value={match.team1}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].team1 = e.target.value;
                  setUpcomingMatches(newMatches);
                  handleFieldChange();
                }}
              />
              <span>vs</span>
              <input
                type="text"
                placeholder="Team B"
                className="upcoming-team2"
                value={match.team2}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].team2 = e.target.value;
                  setUpcomingMatches(newMatches);
                  handleFieldChange();
                }}
              />
              <input
                type="time"
                className="upcoming-time"
                value={match.time}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].time = e.target.value;
                  setUpcomingMatches(newMatches);
                  handleFieldChange();
                }}
              />
              <select
                className="upcoming-court"
                value={match.court}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].court = e.target.value;
                  setUpcomingMatches(newMatches);
                  handleFieldChange();
                }}
              >
                <option value="1">Court 1</option>
                <option value="2">Court 2</option>
              </select>
              <button type="button" className="remove-match" onClick={() => {
                removeMatch(index);
                handleFieldChange();
              }}>×</button>
            </div>
          ))}
        </div>

        <div className="admin-buttons">
          <button type="button" className="admin-btn" onClick={() => {
            addMatchField();
            handleFieldChange();
          }}>
            Add Match ➕
          </button>
        </div>
      </form>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}