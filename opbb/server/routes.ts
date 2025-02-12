import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Server as SocketIOServer } from 'socket.io';
import { Session } from 'express-session';

// Extend Express Request to include session
interface CustomRequest extends Request {
  session: Session & {
    admin_authenticated?: boolean;
  };
}

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

// In-memory storage for match data
let savedMatchData: MatchData = {
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

// Timer intervals for courts
const courtTimers: { [key: string]: NodeJS.Timeout | null } = {
  court1: null,
  court2: null
};

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer);

  // Get initial match data
  app.get('/api/match-data', (_req, res) => {
    res.json(savedMatchData);
  });

  app.post('/api/admin-login', (req: CustomRequest, res) => {
    const { password } = req.body;
    if (password === "Ansh") {
      req.session.admin_authenticated = true;
      res.json({ status: 'success' });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid password' });
    }
  });

  app.post('/api/timer/control', (req: CustomRequest, res) => {
    if (!req.session.admin_authenticated) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { court, action } = req.body;
    const courtKey = `court${court}` as keyof typeof savedMatchData;

    if (action === 'start' && savedMatchData[courtKey].status !== 'live') {
      savedMatchData[courtKey].status = 'live';
      if (courtTimers[courtKey]) {
        clearInterval(courtTimers[courtKey]!);
      }
      courtTimers[courtKey] = setInterval(() => {
        if (savedMatchData[courtKey].timeRemaining > 0) {
          savedMatchData[courtKey].timeRemaining--;
          io.emit('match_update', savedMatchData);
        } else {
          if (courtTimers[courtKey]) {
            clearInterval(courtTimers[courtKey]!);
            courtTimers[courtKey] = null;
          }
          savedMatchData[courtKey].status = 'completed';
          io.emit('match_update', savedMatchData);
        }
      }, 1000);
    } else if (action === 'pause') {
      savedMatchData[courtKey].status = 'paused';
      if (courtTimers[courtKey]) {
        clearInterval(courtTimers[courtKey]!);
        courtTimers[courtKey] = null;
      }
    } else if (action === 'cancel') {
      savedMatchData[courtKey].status = 'cancelled';
      if (courtTimers[courtKey]) {
        clearInterval(courtTimers[courtKey]!);
        courtTimers[courtKey] = null;
      }
    }

    io.emit('match_update', savedMatchData);
    res.json({ status: 'success' });
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    // Send current data to newly connected client
    socket.emit('match_update', savedMatchData);

    socket.on('match_update', (data: MatchData) => {
      savedMatchData = data;
      io.emit('match_update', savedMatchData);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return httpServer;
}