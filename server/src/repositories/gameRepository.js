import { Game } from "../models/Game.js";

export const saveGame = async (gameData) => {
  return Game.findOneAndUpdate({ roomId: gameData.roomId }, gameData, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
};

export const getRecentGames = async (limit = 10) => {
  return Game.find().sort({ startedAt: -1 }).limit(limit).lean();
};

export const getGameByRoomId = async (roomId) => {
  return Game.findOne({ roomId }).lean();
};

export const deleteGameByRoomId = async (roomId) => {
  return Game.findOneAndDelete({ roomId });
};
