// ===== CONSTANTES =====
export const DIRECTIONS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

export const CELL_EMPTY = 0;
export const CELL_WALL = -1;

// ===== FONCTIONS GRILLE =====

export const createGrille = (hauteur, largeur) => {
  return Array(hauteur)
    .fill(null)
    .map(() => Array(largeur).fill(CELL_EMPTY));
};

export const isValidPosition = (grille, x, y) => {
  const hauteur = grille.length;
  const largeur = grille[0].length;

  if (x >= largeur || x < 0) {
    return false;
  }
  if (y >= hauteur || y < 0) {
    return false;
  }
  return true;
};

export const isCellOccupied = (grille, x, y) => {
  if (!isValidPosition(grille, x, y)) {
    return true; // Hors limites = considéré comme occupé
  }
  return grille[y][x] !== CELL_EMPTY;
};

export const setCellOccupied = (grille, x, y, playerId) => {
  if (isValidPosition(grille, x, y)) {
    grille[y][x] = playerId;
  }
};

export const getCellValue = (grille, x, y) => {
  if (!isValidPosition(grille, x, y)) {
    return CELL_WALL;
  }
  return grille[y][x];
};

// ===== FONCTIONS POSITIONNEMENT JOUEURS =====

export const generateStartPositions = (largeur, hauteur, nombreJoueurs) => {
  const positions = [];
  const marge = 3; // Distance minimale du bord

  if (nombreJoueurs === 2) {
    // Deux joueurs: gauche et droite
    positions.push({ x: marge, y: Math.floor(hauteur / 2) });
    positions.push({ x: largeur - marge - 1, y: Math.floor(hauteur / 2) });
  } else if (nombreJoueurs === 3) {
    // Trois joueurs: gauche, droite, haut
    positions.push({ x: marge, y: Math.floor(hauteur / 2) });
    positions.push({ x: largeur - marge - 1, y: Math.floor(hauteur / 2) });
    positions.push({ x: Math.floor(largeur / 2), y: marge });
  } else if (nombreJoueurs === 4) {
    // Quatre joueurs: aux quatre coins (avec marge) je pense a mettre la marge comme constante mais ce sera un debat entre nous.
    positions.push({ x: marge, y: marge });
    positions.push({ x: largeur - marge - 1, y: marge });
    positions.push({ x: marge, y: hauteur - marge - 1 });
    positions.push({ x: largeur - marge - 1, y: hauteur - marge - 1 });
  } else {
    // Pour plus de joueurs: distribution autour du centre
    const centerX = Math.floor(largeur / 2);
    const centerY = Math.floor(hauteur / 2);
    const radius = Math.min(largeur, hauteur) / 3;

    for (let i = 0; i < nombreJoueurs; i++) {
      const angle = (2 * Math.PI * i) / nombreJoueurs;
      const x = Math.floor(centerX + radius * Math.cos(angle));
      const y = Math.floor(centerY + radius * Math.sin(angle));
      positions.push({ x, y });
    }
  }

  return positions;
};

export const getRandomStartDirection = () => {
  const directions = Object.values(DIRECTIONS);
  return directions[Math.floor(Math.random() * directions.length)];
};

export const assignPlayerColors = (nombreJoueurs) => {
  const couleurs = [
    "#FF0000", // Rouge
    "#00FF00", // Vert
    "#0000FF", // Bleu
    "#FFFF00", // Jaune
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Violet
  ];
  return couleurs.slice(0, nombreJoueurs);
};

// ===== FONCTIONS MOUVEMENT =====

export const getDirectionVector = (direction) => {
  switch (direction) {
    case DIRECTIONS.UP:
      return { dx: 0, dy: -1 };
    case DIRECTIONS.DOWN:
      return { dx: 0, dy: 1 };
    case DIRECTIONS.LEFT:
      return { dx: -1, dy: 0 };
    case DIRECTIONS.RIGHT:
      return { dx: 1, dy: 0 };
    default:
      return { dx: 0, dy: 0 };
  }
};

export const getOppositeDirection = (direction) => {
  switch (direction) {
    case DIRECTIONS.UP:
      return DIRECTIONS.DOWN;
    case DIRECTIONS.DOWN:
      return DIRECTIONS.UP;
    case DIRECTIONS.LEFT:
      return DIRECTIONS.RIGHT;
    case DIRECTIONS.RIGHT:
      return DIRECTIONS.LEFT;
    default:
      return direction;
  }
};

export const getNextPosition = (x, y, direction) => {
  const { dx, dy } = getDirectionVector(direction);
  return {
    x: x + dx,
    y: y + dy,
  };
};

export const isValidDirection = (currentDirection, newDirection) => {
  // Ne peut pas faire demi-tour (180 degrés)
  return getOppositeDirection(currentDirection) !== newDirection;
};

export const updatePlayerDirection = (playerState, newDirection) => {
  if (isValidDirection(playerState.direction, newDirection)) {
    playerState.direction = newDirection;
    return true;
  }
  return false;
};

export const movePlayer = (playerState, grille) => {
  // Marquer la position actuelle comme occupée
  setCellOccupied(grille, playerState.x, playerState.y, playerState.pseudo);

  // Calculer la nouvelle position
  const nextPos = getNextPosition(
    playerState.x,
    playerState.y,
    playerState.direction
  );

  // Mettre à jour la position du joueur
  playerState.x = nextPos.x;
  playerState.y = nextPos.y;
};

// ===== FONCTIONS COLLISION =====

export const checkBoundaryCollision = (x, y, largeur, hauteur) => {
  return x < 0 || x >= largeur || y < 0 || y >= hauteur;
};

export const checkWallCollision = (grille, x, y) => {
  return isCellOccupied(grille, x, y);
};

export const checkCollision = (grille, x, y) => {
  const hauteur = grille.length;
  const largeur = grille[0].length;

  // Vérifier les limites
  if (checkBoundaryCollision(x, y, largeur, hauteur)) {
    return true;
  }

  // Vérifier les murs
  if (checkWallCollision(grille, x, y)) {
    return true;
  }

  return false;
};

export const checkHeadToHeadCollision = (players) => {
  const collisions = [];
  const positions = new Map();

  // Regrouper les joueurs par position
  players.forEach((player) => {
    if (player.alive) {
      const key = `${player.x},${player.y}`;
      if (!positions.has(key)) {
        positions.set(key, []);
      }
      positions.get(key).push(player.pseudo);
    }
  });

  // Trouver les positions avec plusieurs joueurs
  positions.forEach((pseudos, position) => {
    if (pseudos.length > 1) {
      collisions.push(...pseudos);
    }
  });

  return collisions;
};

// ===== FONCTIONS GESTION ÉTAT DU JEU =====

export const eliminatePlayer = (playerState, reason = "collision") => {
  playerState.alive = false;
  playerState.eliminatedAt = Date.now();
  playerState.eliminationReason = reason;
};

export const getAlivePlayers = (players) => {
  return players.filter((player) => player.alive);
};

export const checkWinCondition = (players) => {
  const alivePlayers = getAlivePlayers(players);
  return alivePlayers.length <= 1;
};

export const getGameWinner = (players) => {
  const alivePlayers = getAlivePlayers(players);

  if (alivePlayers.length === 1) {
    return alivePlayers[0];
  } else if (alivePlayers.length === 0) {
    // Match nul - tous morts en même temps
    // Le dernier éliminé est le "gagnant"
    const sorted = [...players].sort((a, b) => b.eliminatedAt - a.eliminatedAt);
    return sorted[0];
  }

  return null;
};

export const calculatePlayerRankings = (players) => {
  // Trier: vivants d'abord, puis par temps d'élimination
  return [...players].sort((a, b) => {
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    if (a.alive && b.alive) return 0;
    return b.eliminatedAt - a.eliminatedAt; // Plus tard éliminé = meilleur
  });
};

export const calculateSurvivalTime = (startTime, eliminationTime) => {
  return eliminationTime - startTime;
};

// ===== FONCTIONS MISE À JOUR DU JEU =====

/**
 * Traiter les mouvements de tous les joueurs
 * @param {Object} gameState
 */
export const processPlayerMovements = (gameState) => {
  const alivePlayers = getAlivePlayers(gameState.players);

  alivePlayers.forEach((player) => {
    movePlayer(player, gameState.grille);
  });
};

export const processCollisions = (gameState) => {
  const alivePlayers = getAlivePlayers(gameState.players);

  // Vérifier les collisions frontales d'abord
  const headToHeadCollisions = checkHeadToHeadCollision(alivePlayers);

  headToHeadCollisions.forEach((pseudo) => {
    const player = gameState.players.find((p) => p.pseudo === pseudo);
    if (player && player.alive) {
      eliminatePlayer(player, "head-to-head");
    }
  });

  // Vérifier les collisions avec les murs/limites
  alivePlayers.forEach((player) => {
    if (player.alive) {
      // Peut avoir été éliminé par collision frontale
      if (checkCollision(gameState.grille, player.x, player.y)) {
        eliminatePlayer(player, "wall");
      }
    }
  });
};

export const applyPlayerInputs = (gameState, inputs) => {
  inputs.forEach((input) => {
    const player = gameState.players.find((p) => p.pseudo === input.pseudo);
    if (player && player.alive) {
      updatePlayerDirection(player, input.direction);
    }
  });
};

export const updateGameState = (gameState, inputs = []) => {
  //  Appliquer les inputs des joueurs
  applyPlayerInputs(gameState, inputs);

  //Déplacer tous les joueurs
  processPlayerMovements(gameState);

  //  Vérifier les collisions
  processCollisions(gameState);

  //  Incrémenter le tick
  gameState.tick = (gameState.tick || 0) + 1;

  //  Vérifier la condition de victoire
  gameState.isFinished = checkWinCondition(gameState.players);

  if (gameState.isFinished) {
    gameState.winner = getGameWinner(gameState.players);
    gameState.rankings = calculatePlayerRankings(gameState.players);
  }

  return gameState;
};
