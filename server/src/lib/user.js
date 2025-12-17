import brcypt from 'bcrypt';
import UserModel from '../schemas/User.js';
import connectDb from './db.js';

/**
 * Récupère un utilisateur depuis son nom d'utilisateur.
 *
 * @param {string} username - Le nom de l'utilisateur.
 * @return {Promise<UserModel | null>} L'utilisateur ou `null` si il n'existe pas.
 */
export async function getUserByName(username) {
    try {
        // Connexion à la base de données
        await connectDb();

        // Récupération de l'utilisateur
        return await UserModel.findOne({ username }).lean();
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
 * @return {Promise<object | null>} L'utilisateur a été créé, `null` sinon.
 */
export async function createUser(username, password) {
    try {
        // Connexion à la base de données
        await connectDb();

        // Création de l'utilisateur
        return await UserModel.create({ username, password: await brcypt.hash(password, 10) });
    } catch (error) {
        // Log error
        console.error('Error at createUser:', error);
        return false;
    }
}
