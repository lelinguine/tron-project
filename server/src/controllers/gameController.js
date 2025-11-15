import {
  createGame,
  getGames,
  getGameById,
  updateGame,
  deleteGame,
} from "../repositories/gameRepository";

const createGameRequest = async (req, res) => {
  try {
    const gameData = req.body;
    await createGame(gameData);
    res.status(200).send("Nouveau jeu crée avec succès");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getGameRequest = async (req, res) => {
  try {
    const gameId = req.body.gameId;
    const game = await getGameById(gameId);
    res.status(200).json(game);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getGamesRequest = async (req, res) => {
  try {
    const games = await getGames();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateGameRequest = async (req, res) => {
  try {
    const gameId = req.body.gameId;
    const game = await updateGame(gameId);
    res.status(200).json(game);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteGameRequest = async (req, res) => {
  try {
    const gameId = req.body.gameId;
    const game = await deleteGame(gameId);
    res.status(200).json(game);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const gameRequests = {
  createGameRequest,
  getGameRequest,
  getGamesRequest,
  updateGameRequest,
  deleteGameRequest,
};
