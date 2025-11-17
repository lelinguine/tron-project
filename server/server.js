import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { createServer } from "http";
import { server as WebSocketServer } from "websocket";
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

import { requireBodyFields } from "./src/middleware/validation.js";

await connectDatabase();

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.post("/api/auth/login", requireBodyFields(["pseudo"]), login);

app.get("/api/games", listGames);
app.get("/api/games/:roomId", getGame);
app.delete("/api/games/:roomId", deleteGame);

app.get("/api/stats/leaderboard", leaderboard);
app.get("/api/stats/server", serverStats);

app.get("/api/config", (_req, res) => {
  res.json({ game: GAME_CONFIG });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found` });
});

const httpServer = createServer(app);
const wsServer = new WebSocketServer({ httpServer });

wsServer.on("request", handleWebSocketRequest);

const PORT = 9898;
const HOST = "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  logger.info(`HTTP server listening on http://${HOST}:${PORT}`);
});
