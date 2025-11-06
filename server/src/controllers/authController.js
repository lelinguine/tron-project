import { compare } from 'bcrypt';
import connectDb from '../lib/db';
import { createUser, getUserByName } from '../lib/user';
import { parseBody } from '../utils/http';

/**
 * Gère les requêtes à `/login`
 *
 * @export
 * @param {import('http').IncomingMessage} req - La requête.
 * @param {import('http').ServerResponse} res - La réponse.
 */
export async function login(req, res) {
    // Vérification de la méthode
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
    }

    // Récupération des données
    let payload;
    try {
        payload = JSON.parse((await parseBody(req)) ?? '{}');
    } catch (e) {
        console.error('Invalid JSON:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
    }

    const { username, password } = payload;
    if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing username or password' }));
        return;
    }

    try {
        // Connection à la BD
        await connectDb();

        const user = await getUserByName(username);

        // Création de l'utilisateur si il n'existe pas
        if (!user) {
            const created = await createUser(username, password);
            if (!created) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error while creating user' }));
                return;
            }
        } else {
            // Vérification du mot de passe
            const match = await compare(password, user.password);
            if (!match) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }
        }

        // Succès
        const safeUser = { username: user.username, createdAt: user.createdAt };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, user: safeUser }));
    } catch (error) {
        console.error('Error in login handler:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
}
