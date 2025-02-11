import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer);

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("match_update", (data) => {
      // Broadcast the update to all connected clients
      io.emit("match_update", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // API Routes
  app.get("/api/match-data", (_req, res) => {
    // Initial match data
    res.json({
      court1: {
        team1: "",
        team2: "",
        servingTeam: "team1",
        status: "paused",
        timeRemaining: 600
      },
      court2: {
        team1: "",
        team2: "",
        servingTeam: "team1",
        status: "paused",
        timeRemaining: 600
      },
      nextMatch: "",
      upcoming: []
    });
  });

  app.post("/api/update-match", (req, res) => {
    const matchData = req.body;
    // Broadcast the update to all clients
    io.emit("match_update", matchData);
    res.json({ status: "success" });
  });

  app.post("/api/admin-login", (req, res) => {
    const { password } = req.body;
    // Simple password check - in production use proper authentication
    if (password === "admin123") {
      res.json({ status: "success" });
    } else {
      res.status(401).json({ status: "error", message: "Invalid password" });
    }
  });

  app.get("/api/check-admin", (_req, res) => {
    // For demo purposes, always return true
    res.json({ authenticated: true });
  });

  return httpServer;
}