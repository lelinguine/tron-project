import connectDb from '../lib/db.js';
import User from '../schemas/User.js';

async function seed() {
    try {
        await connectDb();

        // Ajout des joueurs
        for (let i = 0; i <= 5; i++) {
            await User.create({ username: `player${i}`, password: 'password' });
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout des données", error);
    }
}

export default seed();
