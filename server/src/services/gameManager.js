import * as gameLogic from "./gameLogic.js";
import {
  addPlayerToRoom,
  broadcastToRoom,
  removePlayerFromRoom,
} from "../websocket/broadcaster.js";
import { saveGame } from "../repositories/gameRepository.js";
import { updatePlayerStats } from "../repositories/playerRepository.js";
import { logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import { GAME_CONFIG } from "../config/gameConfig.js";

const activeGames = new Map();
const playerInputQueues = new Map();

// ===== CONFIGURATION =====
const DEFAULT_CONFIG = {
  largeur: GAME_CONFIG.gridWidth,
  hauteur: GAME_CONFIG.gridHeight,
  tickRate: GAME_CONFIG.tickRate,
  maxConcurrentGames: 10,
};

// ===== GESTION DU CYCLE DE VIE DES JEUX =====

export const createGame = (players, config = {}) => {
  const roomId = uuidv4();
  const gameConfig = { ...DEFAULT_CONFIG, ...config };

  const grille = gameLogic.createGrille(gameConfig.hauteur, gameConfig.largeur);

  // Générer les positions de départ
  const startPositions = gameLogic.generateStartPositions(
    gameConfig.largeur,
    gameConfig.hauteur,
    players.length
  );

  // Assigner les couleurs
  const colors = gameLogic.assignPlayerColors(players.length);

  // Initialiser les joueurs
  const gamePlayers = players.map((player, index) => ({
    pseudo: player.pseudo,
    x: startPositions[index].x,
    y: startPositions[index].y,
    direction: gameLogic.getRandomStartDirection(),
    alive: true,
    color: colors[index],
    eliminatedAt: null,
    eliminationReason: null,
    connection: player.connection,
  }));

  // Créer l'objet de jeu
  const game = {
    roomId,
    status: "starting",
    startTime: Date.now(),
    tick: 0,
    config: gameConfig,
    grille,
    players: gamePlayers,
    intervalId: null,
    isFinished: false,
    winner: null,
    rankings: null,
  };

  // Stocker le jeu
  activeGames.set(roomId, game);
  playerInputQueues.set(roomId, []);

  gamePlayers.forEach((player) => addPlayerToRoom(roomId, player.pseudo));

  logger.info(`Jeu crée: ${roomId} avec ${players.length} joueurs`);

  // Notifier les joueurs que le jeu commence
  notifyGameStarting(roomId, game);

  // Démarrer le jeu après un countdown
  setTimeout(() => {
    startGameLoop(roomId);
  }, GAME_CONFIG.countdownMs);

  return roomId;
};

export const startGameLoop = (roomId) => {
  const game = activeGames.get(roomId);

  if (!game) {
    logger.error(`Le jeu  ${roomId} n'existe pas`);
    return;
  }

  game.status = "playing";
  game.startTime = Date.now();

  logger.info(`le jeu dans le ${roomId} est lance`);

  // Notifie r les joueurs que le jeu a commence
  broadcastToRoom(roomId, {
    type: "GAME_STARTED",
    roomId,
    message: "La partie commence!",
  });

  // Créer l'interval pour la game loope
  const intervalId = setInterval(() => {
    gameTickUpdate(roomId);
  }, game.config.tickRate);

  game.intervalId = intervalId;
};

const gameTickUpdate = (roomId) => {
  const game = activeGames.get(roomId);

  if (!game || game.isFinished) {
    return;
  }

  try {
    // 1. Récupérer les inputs des joueurs
    const inputs = getPlayerInputs(roomId);

    // 2. Mettre à jour l'état du jeu
    gameLogic.updateGameState(game, inputs);

    // 3. Broadcaster le nouvel état
    broadcastGameState(roomId);

    // 4. Vérifier si le jeu est terminé
    if (game.isFinished) {
      endGame(roomId);
    }
  } catch (error) {
    logger.error(`Erreur pour faire le update du jeu ${roomId}:`, error);
    // En cas d'erreur, terminer le jeu pour éviter des problèmes
    forceEndGame(roomId, "error");
  }
};

export const stopGame = (roomId) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  // Arrêter la game loop
  if (game.intervalId) {
    clearInterval(game.intervalId);
    game.intervalId = null;
  }

  logger.info(`Game stopped: ${roomId}`);
};

const endGame = async (roomId) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  stopGame(roomId);

  game.status = "finished";
  game.endTime = Date.now();

  // Notifier les joueurs
  notifyGameOver(roomId);

  // Sauvegarder dans la base de données
  await saveGameToDatabase(roomId);

  // Nettoyer après un délai
  setTimeout(() => {
    cleanupGame(roomId);
  }, 5000);
};

const forceEndGame = async (roomId, reason = "forced") => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  stopGame(roomId);

  game.status = "finished";
  game.isFinished = true;
  game.endTime = Date.now();

  // Déterminer un gagnant si possible
  game.winner = gameLogic.getGameWinner(game.players);
  game.rankings = gameLogic.calculatePlayerRankings(game.players);

  logger.warn(`Game ${roomId} force ended: ${reason}`);

  // Notifier les joueurs
  broadcastToRoom(roomId, {
    type: "GAME_ENDED",
    reason,
    winner: game.winner ? game.winner.pseudo : null,
    rankings: game.rankings,
  });

  // Sauvegarder et nettoyer
  await saveGameToDatabase(roomId);

  setTimeout(() => {
    cleanupGame(roomId);
  }, 5000);
};

export const cleanupGame = (roomId) => {
  const game = activeGames.get(roomId);
  stopGame(roomId);

  if (game) {
    game.players.forEach((player) =>
      removePlayerFromRoom(roomId, player.pseudo)
    );
  }

  activeGames.delete(roomId);
  playerInputQueues.delete(roomId);

  logger.info(`Game cleaned up: ${roomId}`);
};

// ===== GESTION DES INPUTS JOUEURS =====

export const queuePlayerInput = (roomId, pseudo, direction) => {
  const game = activeGames.get(roomId);

  if (!game || game.status !== "playing") {
    return false;
  }

  // Vérifier que le joueur existe et est vivant
  const player = game.players.find((p) => p.pseudo === pseudo);
  if (!player || !player.alive) {
    return false;
  }

  // Vérifier que la direction est valide
  if (!Object.values(gameLogic.DIRECTIONS).includes(direction)) {
    return false;
  }

  const queue = playerInputQueues.get(roomId);

  // Remplacer l'input précédent du même joueur dans cette queue
  const existingIndex = queue.findIndex((input) => input.pseudo === pseudo);
  if (existingIndex !== -1) {
    queue[existingIndex] = { pseudo, direction };
  } else {
    queue.push({ pseudo, direction });
  }

  return true;
};

const getPlayerInputs = (roomId) => {
  const queue = playerInputQueues.get(roomId) || [];
  playerInputQueues.set(roomId, []);
  return queue;
};

// ===== BROADCASTING ET NOTIFICATIONS =====

const broadcastGameState = (roomId) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  const serializedState = gameLogic.serializeGameState(game);

  broadcastToRoom(roomId, {
    type: "GAME_STATE",
    data: serializedState,
  });
};

const notifyGameStarting = (roomId, game) => {
  const message = {
    type: "GAME_STARTING",
    roomId,
    countdown: Math.ceil(GAME_CONFIG.countdownMs / 1000),
    config: {
      largeur: game.config.largeur,
      hauteur: game.config.hauteur,
    },
    players: game.players.map((p) => ({
      pseudo: p.pseudo,
      color: p.color,
      position: { x: p.x, y: p.y },
    })),
  };

  broadcastToRoom(roomId, message);
};

export const notifyPlayerElimination = (roomId, pseudo, reason) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  const alivePlayers = gameLogic.getAlivePlayers(game.players);

  broadcastToRoom(roomId, {
    type: "PLAYER_ELIMINATED",
    pseudo,
    reason,
    remainingPlayers: alivePlayers.length,
  });
};

const notifyGameOver = (roomId) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  const message = {
    type: "GAME_OVER",
    winner: game.winner ? game.winner.pseudo : null,
    rankings: (game.rankings || []).map((player, index) => ({
      position: index + 1,
      pseudo: player.pseudo,
      survived: player.alive,
      survivalTime: player.eliminatedAt
        ? gameLogic.calculateSurvivalTime(game.startTime, player.eliminatedAt)
        : Date.now() - game.startTime,
    })),
    duration: Date.now() - game.startTime,
  };

  broadcastToRoom(roomId, message);
};

// ===== GESTION DES DÉCONNEXIONS =====

export const handlePlayerDisconnect = (roomId, pseudo) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  logger.info(`Player ${pseudo} disconnected from game ${roomId}`);

  // Trouver et éliminer le joueur
  const player = game.players.find((p) => p.pseudo === pseudo);

  if (player && player.alive) {
    gameLogic.eliminatePlayer(player, "disconnect");
    notifyPlayerElimination(roomId, pseudo, "disconnect");

    // Vérifier si le jeu doit se terminer
    const alivePlayers = gameLogic.getAlivePlayers(game.players);

    if (alivePlayers.length <= 1) {
      game.isFinished = true;
      endGame(roomId);
    }
  }
};

// ===== SAUVEGARDE EN BASE DE DONNÉES =====

const saveGameToDatabase = async (roomId) => {
  const game = activeGames.get(roomId);

  if (!game) {
    return;
  }

  try {
    const rankings =
      game.rankings || gameLogic.calculatePlayerRankings(game.players);

    // Preparer les donnees du jeu
    const gameData = {
      roomId: game.roomId,
      startedAt: new Date(game.startTime),
      endedAt: new Date(game.endTime),
      duration: game.endTime - game.startTime,
      gridSize: {
        width: game.config.largeur,
        height: game.config.hauteur,
      },
      winner: game.winner ? game.winner.pseudo : null,
      players: rankings.map((player, index) => ({
        pseudo: player.pseudo,
        position: index + 1,
        alive: player.alive,
        eliminatedAt: player.eliminatedAt
          ? new Date(player.eliminatedAt)
          : null,
        eliminationReason: player.eliminationReason,
        survivalTime: player.eliminatedAt
          ? player.eliminatedAt - game.startTime
          : game.endTime - game.startTime,
        color: player.color,
      })),
    };

    // Sauvegarder le jeu
    await saveGame(gameData);

    // Mettre a jour les statistiques des joueurs
    await Promise.all(
      rankings.map((player, index) => {
        const isWinner =
          index === 0 && !!game.winner && game.winner.pseudo === player.pseudo;
        const score = Math.max(rankings.length - index, 1);
        return updatePlayerStats(player.pseudo, { isWinner, score });
      })
    );

    logger.info(`Game ${roomId} saved to database`);
  } catch (error) {
    logger.error(`Error saving game ${roomId} to database`, error);
  }
};
