import { compare } from 'bcrypt';
import connectDb from '../lib/db.js';
import { createUser, getUserByName } from '../lib/user.js';
import { parseBody } from '../utils/http.js';

/**
 * @export
 * @type {Record<string, (req: import("http").IncomingMessage, res: import("http").ServerResponse) => Promise<void>}
 */
const authController = {
    ['/login']: login
};

export default authController;

/**
 * Gère les requêtes à `/login`
 *
 * @param {import('http').IncomingMessage} req - La requête.
 * @param {import('http').ServerResponse} res - La réponse.
 */
async function login(req, res) {
    res.setHeader('Content-Type', 'application/json');
    // Vérification de la méthode
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end(JSON.stringify({ error: 'Méthode non autorisée.' }));
        return;
    }

    // Récupération des données
    let payload;
    try {
        payload = JSON.parse((await parseBody(req)) ?? '{}');
    } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Corp de la requête invalide.' }));
        return;
    }

    const { username, password } = payload;
    if (!username || !password) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Aucun nom d'utilisateur ou mot de passe renseigné." }));
        return;
    }

    try {
        // Connection à la BD
        await connectDb();

        let user = await getUserByName(username);

        // Création de l'utilisateur si il n'existe pasF
        if (!user) {
            // Vérification du mot de passe
            if (!user) {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        error: 'Le mot de passe doit faire entre 4 et 16 caractères.'
                    })
                );
                return;
            }

            // Création de l'utilisateur
            user = await createUser(username, password);
            if (!user) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Erreur lors de la création de l'utilisateur" }));
                return;
            }
        } else {
            // Vérification du mot de passe
            const match = await compare(password, user.password);
            if (!match) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Mot de passe incorrect.' }));
                return;
            }
        }

        // Succès
        const safeUser = { username: user.username, createdAt: user.createdAt };

        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, user: safeUser }));
    } catch (error) {
        console.error('Error in login handler:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Erreur serveur.' }));
    }
}
