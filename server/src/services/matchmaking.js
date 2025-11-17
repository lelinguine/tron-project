import { GAME_CONFIG } from "../config/gameConfig.js";
import { createGame } from "./gameManager.js";
import { getConnection, sendToPlayer } from "../websocket/broadcaster.js";
import { logger } from "../utils/logger.js";

const waitingPlayers = new Map();

const getMatchSize = () => GAME_CONFIG.minPlayers;

const notifyQueueUpdate = () => {
  const snapshot = getQueueSnapshot();
  snapshot.forEach((pseudo, index) => {
    sendToPlayer(pseudo, {
      type: "QUEUE_STATUS",
      position: index + 1,
      size: snapshot.length,
    });
  });
};

const formMatchIfPossible = () => {
  const matchSize = getMatchSize();

  while (waitingPlayers.size >= matchSize) {
    const candidates = Array.from(waitingPlayers.values())
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .slice(0, matchSize);

    const players = [];

    candidates.forEach(({ pseudo }) => {
      const connection = getConnection(pseudo);

      if (!connection) {
        waitingPlayers.delete(pseudo);
        logger.warn(`Removed ${pseudo} from queue (connection lost)`);
        return;
      }

      waitingPlayers.delete(pseudo);
      players.push({ pseudo, connection });
    });

    if (players.length < matchSize) {
      players.forEach((player) =>
        waitingPlayers.set(player.pseudo, { pseudo: player.pseudo, joinedAt: Date.now() })
      );
      break;
    }

    const roomId = createGame(players, {
      largeur: GAME_CONFIG.gridWidth,
      hauteur: GAME_CONFIG.gridHeight,
      tickRate: GAME_CONFIG.tickRate,
    });

    players.forEach((player) => {
      sendToPlayer(player.pseudo, {
        type: "MATCH_FOUND",
        roomId,
      });
    });
  }

  notifyQueueUpdate();
};

export const joinQueue = (pseudo) => {
  if (waitingPlayers.has(pseudo)) {
    return { status: "already_queued", queueSize: waitingPlayers.size };
  }

  const connection = getConnection(pseudo);

  if (!connection) {
    return { status: "not_connected" };
  }

  waitingPlayers.set(pseudo, { pseudo, joinedAt: Date.now() });
  logger.info(`${pseudo} joined matchmaking queue`);

  formMatchIfPossible();

  return { status: "queued", queueSize: waitingPlayers.size };
};

export const leaveQueue = (pseudo) => {
  const removed = waitingPlayers.delete(pseudo);
  if (removed) {
    logger.info(`${pseudo} left matchmaking queue`);
    notifyQueueUpdate();
  }
  return removed;
};

export const getQueueSnapshot = () => Array.from(waitingPlayers.keys());
