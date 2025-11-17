import { Player } from "../models/Player.js";

export const createPlayer = async (playerData) => {
  const player = new Player(playerData);
  return player.save();
};

export const getPlayerById = async (playerId) => {
  return Player.findById(playerId);
};

export const getPlayerByPseudo = async (pseudo) => {
  return Player.findOne({ pseudo });
};

export const upsertPlayer = async (pseudo) => {
  return Player.findOneAndUpdate(
    { pseudo },
    { $setOnInsert: { pseudo } },
    { upsert: true, new: true }
  );
};

export const setPlayerOnlineStatus = async (pseudo, isOnline) => {
  return Player.findOneAndUpdate(
    { pseudo },
    {
      isOnline,
      ...(isOnline ? {} : { currentGameId: null }),
    },
    { new: true }
  );
};

export const updatePlayer = async (playerId, updateData) => {
  return Player.findByIdAndUpdate(playerId, updateData, { new: true });
};

export const deletePlayer = async (playerId) => {
  return Player.findByIdAndDelete(playerId);
};

export const updatePlayerStats = async (pseudo, { isWinner = false, score = 0 } = {}) => {
  const update = {
    $inc: {
      "stats.gamesPlayed": 1,
      "stats.totalScore": score,
    },
  };

  if (isWinner) {
    update.$inc["stats.gamesWon"] = 1;
  }

  return Player.findOneAndUpdate({ pseudo }, update, { new: true });
};
