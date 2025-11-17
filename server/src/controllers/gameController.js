import {
  deleteGameByRoomId,
  getGameByRoomId,
  getRecentGames,
} from "../repositories/gameRepository.js";
import { logger } from "../utils/logger.js";
import { parseLimit } from "../utils/helpers.js";

export const listGames = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, { fallback: 10, max: 50 });
    const games = await getRecentGames(limit);
    res.json({ games });
  } catch (error) {
    logger.error("Unable to list games", error);
    res.status(500).json({ message: "Unable to list games" });
  }
};

export const getGame = async (req, res) => {
  try {
    const game = await getGameByRoomId(req.params.roomId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json({ game });
  } catch (error) {
    logger.error("Unable to retrieve game", error);
    res.status(500).json({ message: "Unable to retrieve game" });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const deleted = await deleteGameByRoomId(req.params.roomId);

    if (!deleted) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json({ message: "Game deleted" });
  } catch (error) {
    logger.error("Unable to delete game", error);
    res.status(500).json({ message: "Unable to delete game" });
  }
};
