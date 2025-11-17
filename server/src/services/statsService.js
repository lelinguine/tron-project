import { Player } from "../models/Player.js";
import { Game } from "../models/Game.js";
import { getQueueSnapshot } from "./matchmaking.js";

export const getLeaderboard = async (limit = 10) => {
  return Player.find()
    .sort({ "stats.gamesWon": -1, "stats.totalScore": -1 })
    .limit(limit)
    .lean();
};

export const getServerStats = async () => {
  const [playersCount, gamesCount, onlinePlayers] = await Promise.all([
    Player.countDocuments(),
    Game.countDocuments(),
    Player.countDocuments({ isOnline: true }),
  ]);

  return {
    playersCount,
    gamesCount,
    onlinePlayers,
    queueSize: getQueueSnapshot().length,
  };
};
