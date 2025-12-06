import brcypt from 'bcrypt';
import connectDb from '../lib/db.js';
import { createUser, getUserByName } from '../lib/user.js';

/**
 * Gère la connexion ou l'inscription d'un utilisateur.
 *
 * @export
 * @param {object} data - Les données de connexion.
 * @returns {Promise<object>} - Le statut HTTP et les données de réponse.
 */
export async function handleLogin(data) {
    const { username, password } = data;

    if (!username || !password) {
        return {
            ok: false,
            error: "Aucun nom d'utilisateur ou mot de passe renseigné."
        };
    }

    try {
        // Connexion à la base de données
        await connectDb();
        // Récupération de l'utilisateur
        let user = await getUserByName(username);
        let message = 'Utilisateur connecté.';

        if (!user) {
            // Création de l'utilisateur s'il n'existe pas
            user = await createUser(username, password);
            if (!user) {
                return { ok: false, error: "Erreur lors de la création de l'utilisateur." };
            }
            message = 'Utilisateur créé et connecté.';
        } else if (!(await brcypt.compare(password, user.password))) {
            return { ok: false, error: 'Mot de passe incorrect.' };
        }

        return {
            ok: true,
            success: message,
            user: {
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };
    } catch (error) {
        console.error('Error in login:', error);
        return { ok: false, error: 'Erreur serveur.' };
    }
}
