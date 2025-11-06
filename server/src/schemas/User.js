import mongoose, { Schema, model } from 'mongoose';

/**
 * Le schémas de l'utilisateur.
 *
 * @type {Schema}
 */
const UserSchema = new Schema(
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
 * @type {import('mongoose').Model<{ username: string, password: string, createdAt: Date, updatedAt: Date }>}
 */
const User = mongoose.models.User ?? model('User', UserSchema);

export default User;
