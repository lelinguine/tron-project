import mongoose from 'mongoose';

/**
 * Le schémas d'une partie.
 *
 * @type {mongoose.Schema}
 */
const GameSchema = new mongoose.Schema(
    {
        players: [
            {
                username: { type: String, required: true },
                score: { type: Number, required: true },
                rank: { type: Number, required: true }
            }
        ]
    },
    { timestamps: true }
);

/**
 * Le modèle de l'utilisateur.
 *
 * @export
 * @type {import('mongoose').Model<{ players: { username: string; score: number; rank: number; }[]; createdAt: Date; updatedAt: Date }>}
 */
const GameModel = mongoose.models.Game ?? mongoose.model('Game', GameSchema);

export default GameModel;
