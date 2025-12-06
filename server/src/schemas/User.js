import mongoose from 'mongoose';

/**
 * Le schémas de l'utilisateur.
 *
 * @type {mongoose.Schema}
 */
const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true }
    },
    { timestamps: true }
);

/**
 * Le modèle de l'utilisateur.
 *
 * @export
 * @type {import('mongoose').Model<{ username: string; password: string; createdAt: Date; updatedAt: Date }>}
 */
const UserModel = mongoose.models.User ?? mongoose.model('User', UserSchema);

export default UserModel;
