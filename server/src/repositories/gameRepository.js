import { Game } from "../models/Game";

const createGame = async (gameData) => {
  const game = new Game(gameData);
  return await game.save();
};

const getGames = async () => {
  return await Game.find();
};

const getGameById = async (gameId) => {
  return await Game.findById(gameId);
};

const updateGame = async (gameId, updateData) => {
  return await Game.findByIdAndUpdate(gameId, updateData, { new: true });
};
const deleteGame = async (gameId) => {
  return await Game.findByIdAndDelete(gameId);
};
export const gameRepository = {
  createGame,
  getGames,
  getGameById,

  updateGame,
  deleteGame,
};
