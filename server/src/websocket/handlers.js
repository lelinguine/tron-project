import {
  registerConnection,
  unregisterConnection,
  getPlayerRoom,
} from "./broadcaster.js";
import { logger } from "../utils/logger.js";
import { joinQueue, leaveQueue } from "../services/matchmaking.js";
import {
  queuePlayerInput,
  handlePlayerDisconnect,
} from "../services/gameManager.js";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { setPlayerOnlineStatus } from "../repositories/playerRepository.js";
import { DIRECTIONS, PSEUDO_REGEX } from "../utils/constants.js";
import { safeJsonParse } from "../utils/helpers.js";

const parseMessage = (message) => {
  if (message.type === "utf8") {
    return safeJsonParse(message.utf8Data);
  }
  return null;
};

const ensureIdentified = (connection, pseudo) => {
  if (!pseudo) {
    connection.sendUTF(
      JSON.stringify({
        type: "ERROR",
        message: "You must identify first",
        code: "NOT_IDENTIFIED",
      })
    );
    return false;
  }
  return true;
};

const handleIdentify = (connection, requestedPseudo) => {
  if (!requestedPseudo || !PSEUDO_REGEX.test(requestedPseudo)) {
    connection.sendUTF(
      JSON.stringify({
        type: "ERROR",
        message: "Invalid pseudo",
        code: "INVALID_PSEUDO",
      })
    );
    return null;
  }

  registerConnection(requestedPseudo, connection);
  setPlayerOnlineStatus(requestedPseudo, true).catch((error) => {
    logger.error(`Unable to set player ${requestedPseudo} online`, error);
  });

  connection.sendUTF(
    JSON.stringify({
      type: "HELLO_ACK",
      pseudo: requestedPseudo,
      config: {
        tickRate: GAME_CONFIG.tickRate,
        grid: {
          width: GAME_CONFIG.gridWidth,
          height: GAME_CONFIG.gridHeight,
        },
      },
    })
  );

  return requestedPseudo;
};

const handleQueueJoin = (connection, pseudo) => {
  if (!ensureIdentified(connection, pseudo)) {
    return;
  }

  const result = joinQueue(pseudo);
  connection.sendUTF(
    JSON.stringify({
      type: "QUEUE_ACK",
      status: result.status,
      queueSize: result.queueSize,
    })
  );
};

const handleQueueLeave = (connection, pseudo) => {
  if (!ensureIdentified(connection, pseudo)) {
    return;
  }

  leaveQueue(pseudo);
  connection.sendUTF(
    JSON.stringify({
      type: "QUEUE_LEFT",
    })
  );
};

const handlePlayerInput = (connection, pseudo, direction) => {
  if (!ensureIdentified(connection, pseudo)) {
    return;
  }

  if (!DIRECTIONS.includes(direction)) {
    connection.sendUTF(
      JSON.stringify({
        type: "ERROR",
        message: "Invalid direction",
        code: "INVALID_DIRECTION",
      })
    );
    return;
  }

  const roomId = getPlayerRoom(pseudo);

  if (!roomId) {
    connection.sendUTF(
      JSON.stringify({
        type: "ERROR",
        message: "Player is not in a game",
        code: "NO_GAME",
      })
    );
    return;
  }

  const accepted = queuePlayerInput(roomId, pseudo, direction);

  if (!accepted) {
    connection.sendUTF(
      JSON.stringify({
        type: "ERROR",
        message: "Unable to queue input",
        code: "INPUT_REJECTED",
      })
    );
  }
};

const handleDisconnect = (pseudo) => {
  if (!pseudo) {
    return;
  }

  const roomId = getPlayerRoom(pseudo);
  leaveQueue(pseudo);

  if (roomId) {
    handlePlayerDisconnect(roomId, pseudo);
  }

  unregisterConnection(pseudo);
  setPlayerOnlineStatus(pseudo, false).catch((error) => {
    logger.error(`Unable to set player ${pseudo} offline`, error);
  });
};

export const handleWebSocketRequest = (request) => {
  const connection = request.accept(null, request.origin);
  let pseudo = request.resourceURL?.query?.pseudo || null;

  if (pseudo) {
    pseudo = handleIdentify(connection, pseudo);
  }

  connection.on("message", (message) => {
    const payload = parseMessage(message);

    if (!payload) {
      connection.sendUTF(
        JSON.stringify({
          type: "ERROR",
          message: "Invalid payload",
          code: "INVALID_PAYLOAD",
        })
      );
      return;
    }

    switch (payload.type) {
      case "HELLO":
      case "IDENTIFY":
        pseudo = handleIdentify(connection, payload.pseudo);
        break;
      case "JOIN_QUEUE":
        handleQueueJoin(connection, pseudo);
        break;
      case "LEAVE_QUEUE":
        handleQueueLeave(connection, pseudo);
        break;
      case "PLAYER_INPUT":
        handlePlayerInput(connection, pseudo, payload.direction);
        break;
      case "PING":
        connection.sendUTF(JSON.stringify({ type: "PONG", ts: Date.now() }));
        break;
      default:
        connection.sendUTF(
          JSON.stringify({
            type: "ERROR",
            message: `Unknown message type: ${payload.type}`,
            code: "UNKNOWN_TYPE",
          })
        );
    }
  });

  connection.on("close", () => {
    handleDisconnect(pseudo);
    logger.info(`WebSocket connection closed (${pseudo ?? "anonymous"})`);
  });

  connection.on("error", (error) => {
    logger.error("WebSocket error", error);
    handleDisconnect(pseudo);
  });
};
