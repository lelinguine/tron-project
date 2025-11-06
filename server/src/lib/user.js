import { hash } from 'bcrypt';
import User from '../schemas/User';

/**
 * Récupère un utilisateur depuis son nom d'utilisateur.
 *
 * @param {string} username - Le nom de l'utilisateur.
 * @return {Promise<User | null>} L'utilisateur ou `null` si il n'existe pas.
 */
export function getUserByName(username) {
    try {
        // Récupération de l'utilisateur
        return User.findOne({ username }).lean();
    } catch (error) {
        // Log error
        console.error('Error at getUserByName:', error);
        return null;
    }
}

/**
 * Crée un nouvel utilisateur.
 *
 * @export
 * @param {string} username - Le nom de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @return {Promise<boolean>} `true` si l'utilisateur a été créé, `false` sinon.
 */
export async function createUser(username, password) {
    try {
        // Création de l'utilisateur
        await User.create({ username, password: await hash(password, 10) });
        return true;
    } catch (error) {
        // Log error
        console.error('Error at createUser:', error);
        return false;
    }
}
