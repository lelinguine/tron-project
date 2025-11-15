import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_-]+$/,
      trim: true,
      index: true,
    },

    stats: {
      gamesPlayed: {
        type: Number,
        default: 0,
      },
      gamesWon: {
        type: Number,
        default: 0,
      },
      totalScore: {
        type: Number,
        default: 0,
      },
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentGameId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "players",
  }
);

export const Player = mongoose.model("Player", PlayerSchema);
