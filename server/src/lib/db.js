import { connect } from 'mongoose';

// Récupération de l'URI de la BD
// TODO: mongo URI
const MONGO_URI = '';
if (!MONGO_URI) {
    throw new Error('The MongoDB connection string is missing.');
}

// Si aucune instance en cache, on la créée
if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}
const cached = global.mongoose;

/**
 * Connecte à la base de données MongoDB.
 */
async function connectDb() {
    // Si aucune connection en cache
    if (!cached.conn) {
        // Si aucune promise en cache, on la créée
        if (!cached.promise) {
            cached.promise = connect(MONGO_URI, { bufferCommands: false });
        }

        try {
            // Store la connection
            cached.conn = await cached.promise;
        } catch (e) {
            // Rééinitialise le cache
            cached.promise = null;
            throw e;
        }
    }
}

export default connectDb;
