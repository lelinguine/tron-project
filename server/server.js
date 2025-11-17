import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { server as WebSocketServer } from "websocket";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./src/config/database.js";
import { login } from "./src/controllers/authController.js";
import {
  listGames,
  getGame,
  deleteGame,
} from "./src/controllers/gameController.js";
import { leaderboard, serverStats } from "./src/controllers/statsController.js";
import { handleWebSocketRequest } from "./src/websocket/handlers.js";
import { GAME_CONFIG } from "./src/config/gameConfig.js";
import { logger } from "./src/utils/logger.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDatabase();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.post("/api/auth/login", login);

app.get("/api/games", listGames);
app.get("/api/games/:roomId", getGame);
app.delete("/api/games/:roomId", deleteGame);

app.get("/api/stats/leaderboard", leaderboard);
app.get("/api/stats/server", serverStats);

app.get("/api/config", (_req, res) => {
  res.json({ game: GAME_CONFIG });
});

// Serve index.html for any other routes (SPA fallback)
app.use((req, res) => {
  // If it's an API route that wasn't matched, return 404
  if (req.path.startsWith("/api/")) {
    return res
      .status(404)
      .json({ message: `Route ${req.method} ${req.path} not found` });
  }

  // Otherwise serve the HTML file
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ httpServer });

wsServer.on("request", handleWebSocketRequest);

const PORT = 9898;
const HOST = "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  logger.info(`HTTP server listening on http://${HOST}:${PORT}`);
  logger.info(`Serving client from http://${HOST}:${PORT}`);
});
