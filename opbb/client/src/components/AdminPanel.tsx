import React, { useState } from 'react';
import { useMatchData } from '../context/SocketContext';
import { useAdmin } from '../hooks/useAdmin';
import { Button } from '@/components/ui/button';

interface MatchInputGroup {
  team1: string;
  team2: string;
  time: string;
  court: string;
}

const AdminPanel: React.FC = () => {
  const { matchData, updateMatchData, controlTimer } = useMatchData();
  const { isAuthenticated, login } = useAdmin();
  const [upcomingMatches, setUpcomingMatches] = useState<MatchInputGroup[]>(matchData.upcoming);

  const handleStatusChange = async (courtNumber: number, newStatus: 'paused' | 'live' | 'completed' | 'cancelled') => {
    const courtKey = `court${courtNumber}` as const;
    if (newStatus === 'live') {
      await controlTimer(courtNumber, 'start');
    } else if (newStatus === 'paused') {
      await controlTimer(courtNumber, 'pause');
    } else if (newStatus === 'cancelled') {
      await controlTimer(courtNumber, 'cancel');
    }

    updateMatchData({
      ...matchData,
      [courtKey]: {
        ...matchData[courtKey],
        status: newStatus,
      }
    });
  };

  const handleServingTeamChange = (courtNumber: number, team: 'team1' | 'team2') => {
    const courtKey = `court${courtNumber}` as const;
    updateMatchData({
      ...matchData,
      [courtKey]: {
        ...matchData[courtKey],
        servingTeam: team,
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMatchData({
      ...matchData,
      upcoming: upcomingMatches
    });
  };

  const addMatchField = () => {
    setUpcomingMatches([...upcomingMatches, {
      team1: '',
      team2: '',
      time: '',
      court: '1'
    }]);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <form className="login-form" onSubmit={(e) => {
          e.preventDefault();
          const password = (e.currentTarget[0] as HTMLInputElement).value;
          login(password);
        }}>
          <div className="login-header">🔐 Admin Login</div>
          <input type="password" className="login-input" placeholder="Enter Password" required />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel show">
      <div className="admin-header">🎾 Admin Controls</div>
      <form className="admin-form" onSubmit={handleSubmit}>
        {[1, 2].map(courtNum => (
          <div key={courtNum} className="court-control">
            <h3>Court {courtNum} Match</h3>
            <div className="form-group">
              <label>Team 1 Name</label>
              <input 
                type="text" 
                value={matchData[`court${courtNum}`].team1}
                onChange={(e) => updateMatchData({
                  ...matchData,
                  [`court${courtNum}`]: {
                    ...matchData[`court${courtNum}`],
                    team1: e.target.value
                  }
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Team 2 Name</label>
              <input 
                type="text" 
                value={matchData[`court${courtNum}`].team2}
                onChange={(e) => updateMatchData({
                  ...matchData,
                  [`court${courtNum}`]: {
                    ...matchData[`court${courtNum}`],
                    team2: e.target.value
                  }
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Match Status</label>
              <select
                value={matchData[`court${courtNum}`].status}
                onChange={(e) => handleStatusChange(courtNum, e.target.value as 'paused' | 'live' | 'completed' | 'cancelled')}
              >
                <option value="paused">Paused</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Serving Team</label>
              <select
                value={matchData[`court${courtNum}`].servingTeam}
                onChange={(e) => handleServingTeamChange(courtNum, e.target.value as 'team1' | 'team2')}
              >
                <option value="team1">Team 1</option>
                <option value="team2">Team 2</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                onClick={() => controlTimer(courtNum, 'start')}
                disabled={matchData[`court${courtNum}`].status === 'live'}
              >
                Start Timer
              </Button>
              <Button
                type="button"
                onClick={() => controlTimer(courtNum, 'pause')}
                disabled={matchData[`court${courtNum}`].status !== 'live'}
              >
                Pause Timer
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => controlTimer(courtNum, 'cancel')}
              >
                Cancel Match
              </Button>
            </div>
          </div>
        ))}

        <div className="form-group">
          <label>Next Match</label>
          <input 
            type="text"
            value={matchData.nextMatch}
            onChange={(e) => updateMatchData({
              ...matchData,
              nextMatch: e.target.value
            })}
          />
        </div>

        <h3>Upcoming Matches</h3>
        <div id="upcomingMatches">
          {upcomingMatches.map((match, index) => (
            <div key={index} className="match-input-group">
              <input
                type="text"
                placeholder="Team 1"
                value={match.team1}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].team1 = e.target.value;
                  setUpcomingMatches(newMatches);
                }}
              />
              <input
                type="text"
                placeholder="Team 2"
                value={match.team2}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].team2 = e.target.value;
                  setUpcomingMatches(newMatches);
                }}
              />
              <input
                type="time"
                value={match.time}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].time = e.target.value;
                  setUpcomingMatches(newMatches);
                }}
              />
              <select
                value={match.court}
                onChange={(e) => {
                  const newMatches = [...upcomingMatches];
                  newMatches[index].court = e.target.value;
                  setUpcomingMatches(newMatches);
                }}
              >
                <option value="1">Court 1</option>
                <option value="2">Court 2</option>
              </select>
              <button
                type="button"
                className="remove-match"
                onClick={() => {
                  const newMatches = upcomingMatches.filter((_, i) => i !== index);
                  setUpcomingMatches(newMatches);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="admin-buttons">
          <button type="button" className="admin-btn" onClick={addMatchField}>
            Add Match ➕
          </button>
          <button type="submit" className="admin-btn save">
            Save All 💾
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;