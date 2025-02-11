import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export interface MatchData {
  team1: string;
  team2: string;
  servingTeam: 'team1' | 'team2';
  status: 'paused' | 'live' | 'completed';
  timeRemaining: number;
}

interface UpcomingMatch {
  team1: string;
  team2: string;
  time: string;
  court: string;
}

interface MatchState {
  court1: MatchData;
  court2: MatchData;
  nextMatch: string;
  upcoming: UpcomingMatch[];
}

interface MatchContextType {
  matchData: MatchState;
  updateMatchData: (data: MatchState) => void;
}

const defaultMatchState: MatchState = {
  court1: {
    team1: '',
    team2: '',
    servingTeam: 'team1',
    status: 'paused',
    timeRemaining: 600
  },
  court2: {
    team1: '',
    team2: '',
    servingTeam: 'team1',
    status: 'paused',
    timeRemaining: 600
  },
  nextMatch: '',
  upcoming: []
};

const MatchContext = createContext<MatchContextType>({
  matchData: defaultMatchState,
  updateMatchData: () => {}
});

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [matchData, setMatchData] = useState<MatchState>(defaultMatchState);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on('match_update', (data: MatchState) => {
        setMatchData(prevData => ({
          ...data,
          court1: {
            ...data.court1,
            // Keep previous timer value if paused, use new value if status changes or for live matches
            timeRemaining: data.court1.status === prevData.court1.status && data.court1.status === 'paused' ? 
              prevData.court1.timeRemaining : data.court1.timeRemaining
          },
          court2: {
            ...data.court2,
            // Keep previous timer value if paused, use new value if status changes or for live matches
            timeRemaining: data.court2.status === prevData.court2.status && data.court2.status === 'paused' ? 
              prevData.court2.timeRemaining : data.court2.timeRemaining
          }
        }));
      });

      // Initial data load
      fetch('/api/match-data')
        .then(res => res.json())
        .then(data => setMatchData(data))
        .catch(console.error);

      // Timer update logic - only decrements when status is 'live'
      const timerInterval = setInterval(() => {
        setMatchData(prevData => ({
          ...prevData,
          court1: {
            ...prevData.court1,
            timeRemaining: prevData.court1.status === 'live' 
              ? Math.max(0, prevData.court1.timeRemaining - 1)
              : prevData.court1.timeRemaining,
            // Automatically set to completed when timer reaches 0
            status: prevData.court1.timeRemaining <= 1 && prevData.court1.status === 'live' 
              ? 'completed' 
              : prevData.court1.status
          },
          court2: {
            ...prevData.court2,
            timeRemaining: prevData.court2.status === 'live'
              ? Math.max(0, prevData.court2.timeRemaining - 1)
              : prevData.court2.timeRemaining,
            // Automatically set to completed when timer reaches 0
            status: prevData.court2.timeRemaining <= 1 && prevData.court2.status === 'live' 
              ? 'completed' 
              : prevData.court2.status
          }
        }));
      }, 1000);

      return () => {
        clearInterval(timerInterval);
        socket.off('match_update');
      };
    }
  }, [socket]);

  const updateMatchData = (data: MatchState) => {
    setMatchData(data);
    socket?.emit('match_update', data);
  };

  return (
    <MatchContext.Provider value={{ matchData, updateMatchData }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  return useContext(MatchContext);
}