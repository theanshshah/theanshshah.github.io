import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { apiRequest } from '@/lib/queryClient';

interface MatchData {
  court1: {
    team1: string;
    team2: string;
    servingTeam: 'team1' | 'team2';
    status: 'paused' | 'live' | 'completed' | 'cancelled';
    timeRemaining: number;
  };
  court2: {
    team1: string;
    team2: string;
    servingTeam: 'team1' | 'team2';
    status: 'paused' | 'live' | 'completed' | 'cancelled';
    timeRemaining: number;
  };
  nextMatch: string;
  upcoming: Array<{
    team1: string;
    team2: string;
    time: string;
    court: string;
  }>;
}

interface SocketContextType {
  matchData: MatchData;
  updateMatchData: (data: MatchData) => void;
  controlTimer: (court: number, action: 'start' | 'pause' | 'cancel') => Promise<void>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket] = useState(() => io());
  const [matchData, setMatchData] = useState<MatchData>({
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
  });

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/match-data');
        const data = await response.json();
        setMatchData(data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    socket.on('match_update', (data: MatchData) => {
      setMatchData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const updateMatchData = (data: MatchData) => {
    socket.emit('match_update', data);
  };

  const controlTimer = async (court: number, action: 'start' | 'pause' | 'cancel') => {
    try {
      await apiRequest('POST', '/api/timer/control', { court, action });
    } catch (error) {
      console.error('Error controlling timer:', error);
      throw error;
    }
  };

  return (
    <SocketContext.Provider value={{ matchData, updateMatchData, controlTimer }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useMatchData = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useMatchData must be used within a SocketProvider');
  }
  return context;
};