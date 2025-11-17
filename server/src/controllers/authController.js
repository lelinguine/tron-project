import { compare } from 'bcrypt';
import connectDb from '../lib/db.js';
import { createUser, getUserByName } from '../lib/user.js';

export async function handleLogin(username, password) {
    if (!username || !password) {
        return { status: 400, data: { error: "Aucun nom d'utilisateur ou mot de passe renseigné." } };
    }

    try {
        await connectDb();
        let user = await getUserByName(username);

        if (!user) {
            user = await createUser(username, password);
            if (!user) {
                return { status: 500, data: { error: "Erreur lors de la création de l'utilisateur" } };
            }
        } else {
            const match = await compare(password, user.password);
            if (!match) {
                return { status: 401, data: { error: 'Mot de passe incorrect.' } };
            }
        }

        const safeUser = { username: user.username, createdAt: user.createdAt };
        return { status: 200, data: { ok: true, user: safeUser } };
    } catch (error) {
        console.error('Error in login handler:', error);
        return { status: 500, data: { error: 'Erreur serveur.' } };
    }
}
