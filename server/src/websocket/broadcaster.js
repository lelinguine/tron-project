const connections = new Map();
const rooms = new Map();

export const registerConnection = (pseudo, connection) => {
  if (connections.has(pseudo)) {
    const previous = connections.get(pseudo);
    try {
      previous.close();
    } catch (error) {
      console.error(`Error closing previous connection for ${pseudo}`, error);
    }
  }

  connections.set(pseudo, connection);
  console.log(`[ws] registered connection for ${pseudo}`);
};

export const unregisterConnection = (pseudo) => {
  connections.delete(pseudo);

  for (const [roomId, players] of rooms.entries()) {
    if (players.has(pseudo)) {
      players.delete(pseudo);
      if (players.size === 0) {
        rooms.delete(roomId);
      }
    }
  }

  console.log(`[ws] removed connection for ${pseudo}`);
};

export const getConnection = (pseudo) => connections.get(pseudo) || null;

export const addPlayerToRoom = (roomId, pseudo) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(pseudo);
};

export const removePlayerFromRoom = (roomId, pseudo) => {
  if (!rooms.has(roomId)) {
    return;
  }

  const players = rooms.get(roomId);
  players.delete(pseudo);

  if (players.size === 0) {
    rooms.delete(roomId);
  }
};

export const getRoomPlayers = (roomId) => rooms.get(roomId) || new Set();

export const getPlayerRoom = (pseudo) => {
  for (const [roomId, players] of rooms.entries()) {
    if (players.has(pseudo)) {
      return roomId;
    }
  }
  return null;
};

export const sendToPlayer = (pseudo, message) => {
  const connection = connections.get(pseudo);

  if (!connection) {
    console.warn(`[ws] cannot send message to ${pseudo} (not connected)`);
    return false;
  }

  try {
    connection.sendUTF(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error(`[ws] error sending to ${pseudo}`, error);
    return false;
  }
};

export const broadcastToRoom = (roomId, message) => {
  const players = rooms.get(roomId);

  if (!players || players.size === 0) {
    return 0;
  }

  let delivered = 0;
  const payload = JSON.stringify(message);

  for (const pseudo of players) {
    const connection = connections.get(pseudo);
    if (!connection) {
      continue;
    }

    try {
      connection.sendUTF(payload);
      delivered++;
    } catch (error) {
      console.error(`[ws] error broadcasting to ${pseudo}`, error);
    }
  }

  return delivered;
};

export const broadcastToRoomExcept = (roomId, excludePseudo, message) => {
  const players = rooms.get(roomId);

  if (!players || players.size === 0) {
    return 0;
  }

  let delivered = 0;
  const payload = JSON.stringify(message);

  for (const pseudo of players) {
    if (pseudo === excludePseudo) {
      continue;
    }

    const connection = connections.get(pseudo);
    if (!connection) {
      continue;
    }

    try {
      connection.sendUTF(payload);
      delivered++;
    } catch (error) {
      console.error(`[ws] error broadcasting to ${pseudo}`, error);
    }
  }

  return delivered;
};

export const broadcastToAll = (message) => {
  let delivered = 0;
  const payload = JSON.stringify(message);

  for (const [pseudo, connection] of connections.entries()) {
    try {
      connection.sendUTF(payload);
      delivered++;
    } catch (error) {
      console.error(`[ws] error broadcasting to ${pseudo}`, error);
    }
  }

  return delivered;
};

export const sendError = (pseudo, errorMessage, errorCode = "UNKNOWN_ERROR") => {
  sendToPlayer(pseudo, {
    type: "ERROR",
    message: errorMessage,
    code: errorCode,
  });
};
