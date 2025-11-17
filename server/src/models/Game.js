import mongoose from "mongoose";

const PlayerResultSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    alive: {
      type: Boolean,
      default: false,
    },
    eliminatedAt: {
      type: Date,
      default: null,
    },
    eliminationReason: {
      type: String,
      default: null,
    },
    survivalTime: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#FFFFFF",
    },
  },
  { _id: false }
);

const GameSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    gridSize: {
      width: { type: Number, required: true, min: 1 },
      height: { type: Number, required: true, min: 1 },
    },
    winner: {
      type: String,
      default: null,
    },
    players: {
      type: [PlayerResultSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "games",
  }
);

export const Game = mongoose.model("Game", GameSchema);
