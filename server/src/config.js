// Config serveur
/**
 * Port d'écoute du serveur.
 *
 * @export
 * @type {number}
 */
export const PORT = process.env.PORT || 9898;

// config du jeu
/**
 * Le multiplicateur de points pour un kill.
 *
 * @export
 * @type {number}
 */
export const KILL_MULTIPLIER = 5;
/**
 * La taille du terrain de jeu (en nombre de cases).
 *
 * @export
 * @type {number}
 */
export const GAME_SIZE = 50;
/**
 * La fréquence de mise à jour du jeu (ticks par seconde).
 *
 * @export
 * @type {number}
 */
export const TICK_RATE = 10;

/**
 * Les couleurs disponibles pour les joueurs.
 *
 * @export
 * @type {string[]}
 */
export const COLORS = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff'];
