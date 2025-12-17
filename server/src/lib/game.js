import GameModel from '../schemas/Game.js';
import connectDb from './db.js';

/**
 * Récupère toutes les parties sauvegardées dans la base de données.
 *
 * @export
 * @return {Promise<({ players: ({ username: string; score: number; rank: number; })[] })[]>}
 */
export async function getGames() {
    try {
        // Connexion à la base de données
        await connectDb();

        return await GameModel.find().lean();
    } catch (error) {
        // Log error
        console.error('Error at getGames:', error);
        return [];
    }
}

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
