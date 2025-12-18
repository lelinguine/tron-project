/**
 * Les directions possibles pour un joueur.
 *
 * @export
 * @enum {string}
 */
const Direction = {
    Up: 'up',
    Down: 'down',
    Left: 'left',
    Right: 'right'
};

export default Direction;

/**
 * Les directions opposées.
 *
 * @export
 * @type {Record<Direction, Direction>}
 */
export const OppositeDirection = {
    [Direction.Up]: Direction.Down,
    [Direction.Down]: Direction.Up,
    [Direction.Left]: Direction.Right,
    [Direction.Right]: Direction.Left
};
