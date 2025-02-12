import React, { createContext, useContext, useState } from 'react';

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

// Sample static data
const defaultMatchData: MatchData = {
  court1: {
    team1: 'Team A',
    team2: 'Team B',
    servingTeam: 'team1',
    status: 'paused',
    timeRemaining: 600
  },
  court2: {
    team1: 'Team C',
    team2: 'Team D',
    servingTeam: 'team1',
    status: 'paused',
    timeRemaining: 600
  },
  nextMatch: 'Team E vs Team F',
  upcoming: [
    {
      team1: 'Team G',
      team2: 'Team H',
      time: '14:00',
      court: '1'
    }
  ]
};

const StaticSocketContext = createContext<SocketContextType | null>(null);

export const StaticSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matchData, setMatchData] = useState<MatchData>(defaultMatchData);

  const updateMatchData = (data: MatchData) => {
    setMatchData(data);
  };

  const controlTimer = async (court: number, action: 'start' | 'pause' | 'cancel') => {
    const courtKey = `court${court}` as keyof typeof matchData;
    const newMatchData = { ...matchData };

    switch (action) {
      case 'start':
        newMatchData[courtKey].status = 'live';
        break;
      case 'pause':
        newMatchData[courtKey].status = 'paused';
        break;
      case 'cancel':
        newMatchData[courtKey].status = 'cancelled';
        break;
    }

    setMatchData(newMatchData);
  };

  return (
    <StaticSocketContext.Provider value={{ matchData, updateMatchData, controlTimer }}>
      {children}
    </StaticSocketContext.Provider>
  );
};

export const useStaticMatchData = () => {
  const context = useContext(StaticSocketContext);
  if (!context) {
    throw new Error('useStaticMatchData must be used within a StaticSocketProvider');
  }
  return context;
};
