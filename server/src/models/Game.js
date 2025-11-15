import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tick: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    timestamp: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },

    players: {
      type: Map,
      of: new mongoose.Schema(
        {
          position: {
            x: {
              type: Number,
              required: true,
              min: 0,
            },
            y: {
              type: Number,
              required: true,
              min: 0,
            },
          },
          direction: {
            type: String,
            required: true,
            enum: ["UP", "DOWN", "LEFT", "RIGHT"],
          },
          alive: {
            type: Boolean,
            required: true,
            default: true,
          },
          color: {
            type: String,
            required: true,
            match: /^#[0-9A-Fa-f]{6}$/,
          },
        },
        { _id: false }
      ),
      required: true,
    },

    trails: {
      type: Map,
      of: [[Number]],
      required: true,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    collection: "games",
  }
);

export const Game = mongoose.model("Game", GameSchema);
