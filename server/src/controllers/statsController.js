import { getGames } from '../lib/game.js';

export async function handleGetDashboard() {
    const games = await getGames();

    // Créer un objet pour regrouper les statistiques par joueur
    const playerStats = {};

    // Parcour de toutes les parties
    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        // Parcour de tous les joueurs de la partie
        for (let j = 0; j < game.players.length; j++) {
            const player = game.players[j];
            const { username, score, rank } = player;

            // Initialisation des statistiques du joueur s'il n'existe pas encore
            if (!playerStats[username]) {
                playerStats[username] = {
                    username,
                    totalScore: 0,
                    victories: 0
                };
            }

            // Ajout du score
            playerStats[username].totalScore += score;

            if (rank === 1) {
                // Ajout d'une victoire
                playerStats[username].victories += 1;
            }
        }
    }

    // Convertir l'objet en tableau et trier par victoires décroissant
    const ranks = Object.values(playerStats).sort((a, b) => b.victories - a.victories);

    return { ranks, type: 'rank' };
}
