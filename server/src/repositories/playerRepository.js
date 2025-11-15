import { Player } from "../models/Player";

const createPlayer = async (playerData) => {
  const player = new Player(playerData);
  return await player.save();
};

const getPlayerById = async (playerId) => {
  return await Player.findById(playerId);
};
const addPlayer = async (playerData) => {
  const player = new Player(playerData);
  return await player.save();
};
const updatePlayer = async (playerId, updateData) => {
  return await Player.findByIdAndUpdate(playerId, updateData, { new: true });
};
const deletePlayer = async (playerId) => {
  return await Player.findByIdAndDelete(playerId);
};
export const playerRepository = {
  createPlayer,
  getPlayerById,
  addPlayer,
  updatePlayer,
  deletePlayer,
};
