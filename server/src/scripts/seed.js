import 'dotenv/config';
import connectDb from '../lib/db.js';
import { createUser } from '../lib/user.js';

async function seed() {
    try {
        await connectDb();

        // Ajout des joueurs
        for (let i = 0; i <= 5; i++) {
            await createUser(`player${i}`, 'password');
            console.log(`player${i} créé`);
        }

        console.log('Seed terminé avec succès');
        process.exit(0);
    } catch (error) {
        console.error("Erreur lors de l'ajout des données", error);
        process.exit(1);
    }
}

seed();
