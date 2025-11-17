import { getLeaderboard, getServerStats } from "../services/statsService.js";
import { logger } from "../utils/logger.js";
import { parseLimit } from "../utils/helpers.js";

export const leaderboard = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, { fallback: 10, min: 1, max: 50 });
    const players = await getLeaderboard(limit);

    res.json({
      players: players.map((player) => ({
        pseudo: player.pseudo,
        stats: player.stats,
      })),
    });
  } catch (error) {
    logger.error("Unable to retrieve leaderboard", error);
    res.status(500).json({ message: "Unable to retrieve leaderboard" });
  }
};

export const serverStats = async (_req, res) => {
  try {
    const stats = await getServerStats();
    res.json(stats);
  } catch (error) {
    logger.error("Unable to retrieve server stats", error);
    res.status(500).json({ message: "Unable to retrieve server stats" });
  }
};
