import GameModel from '../schemas/Game.js';

/**
 * Sauvegarde une partie dans la base de données.
 *
 * @export
 * @param {import('../model/Game').default} game
 * @return {Promise<object | null>} La partie a été sauvegardée, `null` sinon.
 */
export async function saveGame(game) {
    try {
        return await GameModel.create({
            players: game.playersArray.map((player) => ({
                username: player.username,
                score: player.score,
                rank: player.rank
            }))
        });
    } catch (error) {
        // Log error
        console.error('Error at createGame:', error);
        return false;
    }
}
