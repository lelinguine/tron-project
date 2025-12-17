import { KILL_MULTIPLIER, RANK_BONUS } from '../config.js';
import Direction, { OppositeDirection } from '../enums/Direction.js';

/**
 * Représente un joueur dans une partie.
 *
 * @export
 * @class Player
 */
class Player {
    /**
     * La connexion WebSocket du joueur.
     *
     * @type {import('websocket').connection}
     * @memberof Player
     */
    _connection;
    /**
     * Le nom d'utilisateur.
     *
     * @type {string}
     * @memberof Player
     */
    _username;
    /**
     * La couleur du joueur.
     *
     * @type {string}
     * @memberof Player
     */
    _color;
    /**
     *
     * La position du joueur.
     *
     * @type {{ x: number; y: number; }}
     * @memberof Player
     */
    _position;
    /**
     * La direction actuelle du joueur.
     *
     * @type {Direction}
     * @memberof Player
     */
    _direction;
    /**
     * La liste des positions précédentes du joueur (sa "trace").
     *
     * @type {({ x: number; y: number; })[]}
     * @memberof Player
     */
    trail;
    /**
     * Le nombre de kills du joueur.
     *
     * @type {number}
     * @memberof Player
     */
    _kills;
    /**
     * Indique si le joueur est vivant ou non.
     *
     * @type {boolean}
     * @memberof Player
     */
    _isAlive;
    /**
     * Le rang du joueur à la fin de la partie.
     *
     * @type {(number | null)}
     * @memberof Player
     */
    rank;
    /**
     * Le nombre de joueurs dans la partie (pour le calcul du score).
     *
     * @type {number}
     * @memberof Player
     */
    _nbPlayersInGame;

    /**
     * Crée une nouvelle instance de {@link Player}.
     *
     * @param {import('websocket').connection} connection - La connexion WebSocket du joueur.
     * @param {string} username - L'utilisateur.
     * @param {string} color - La couleur du joueur.
     * @param {{ x: number; y: number; }} position - La position initiale du joueur.
     * @param {Direction} direction - La direction initiale du joueur.
     * @param {number} nbPlayersInGame - Le nombre de joueurs dans la partie.
     * @memberof Player
     */
    constructor(connection, username, color, position, direction, nbPlayersInGame) {
        this._connection = connection;
        this._username = username;
        this._color = color;
        this._position = position;
        this._direction = direction;
        this._nbPlayersInGame = nbPlayersInGame;
        this.trail = [{ ...position }];
        this._kills = 0;
        this._isAlive = true;
        this.rank = null;
    }

    /**
     * La connexion WebSocket du joueur.
     *
     * @readonly
     * @type {import('websocket').connection}
     * @memberof Player
     */
    get connection() {
        return this._connection;
    }

    /**
     * L'utilisateur.
     *
     * @readonly
     * @type {string}
     * @memberof Player
     */
    get username() {
        return this._username;
    }

    /**
     * La position du joueur.
     *
     * @readonly
     * @type {{ x: number; y: number; }}
     * @memberof Player
     */
    get position() {
        return this._position;
    }

    /**
     * La couleur du joueur.
     *
     * @readonly
     * @type {string}
     * @memberof Player
     */
    get color() {
        return this._color;
    }

    /**
     * La direction actuelle du joueur.
     *
     * @type {Direction}
     * @memberof Player
     */
    get direction() {
        return this._direction;
    }

    /**
     * @param {Direction} d - La nouvelle direction.
     * @memberof Player
     */
    set direction(d) {
        if (d !== OppositeDirection[this._direction]) {
            this._direction = d;
        }
    }

    /**
     * Indique si le joueur est vivant ou non.
     *
     * @readonly
     * @type {boolean}
     * @memberof Player
     */
    get isAlive() {
        return this._isAlive;
    }

    /**
     * Le score du joueur.
     *
     * @readonly
     * @type {number}
     * @memberof Player
     */
    get score() {
        return (
            this.trail.length +
            this._kills * KILL_MULTIPLIER +
            (this.rank ? RANK_BONUS[this._nbPlayersInGame][this.rank - 1] : 0)
        );
    }

    /**
     * Incrémente le nombre de kills du joueur.
     *
     * @memberof Player
     */
    addKill() {
        this._kills++;
    }

    /**
     * Marque le joueur comme mort.
     *
     * @memberof Player
     */
    die() {
        this._isAlive = false;
    }

    /**
     * Déplace le joueur d'une case en fonction de sa direction.
     *
     * @memberof Player
     */
    move() {
        if (!this._isAlive) {
            return;
        }

        // Met à jour la position du joueur en fonction de sa direction
        switch (this.direction) {
            case Direction.Up:
                this._position.y -= 1;
                break;
            case Direction.Down:
                this._position.y += 1;
                break;
            case Direction.Left:
                this._position.x -= 1;
                break;
            case Direction.Right:
                this._position.x += 1;
                break;
        }

        // Ajout de la nouvelle position dans la traînée
        this.trail.push({ ...this._position });
    }

    /**
     * Vérifie si un joueur entre en collision avec la traînée.
     *
     * @param {Player} player - Le joueur à vérifier.
     * @return {boolean} `true` si une collision est détectée, sinon `false`.
     * @memberof Player
     */
    checkTrailCollision(player, isSamePlayer) {
        const trail = isSamePlayer ? this.trail.slice(0, -1) : this.trail;

        return trail.some(({ x, y }) => x === player.position.x && y === player.position.y);
    }

    /**
     * Convertit le joueur en un format adapté pour le client.
     *
     * @return {object} Le joueur lisible pour le client.
     * @memberof Player
     */
    toClient() {
        return {
            username: this._username,
            color: this._color,
            position: this._position,
            direction: this._direction,
            trail: this.trail,
            score: this.score,
            isAlive: this._isAlive,
            rank: this.rank
        };
    }
}

export default Player;
