import { Mongoose } from "mongoose";
const generateSchema = require("generate-schema"); // je prends ce pachage pour generer le schema mongoose à partir du json schema; je l' ai pris directement dans le excel
const game_json = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "GameState",
  title: "Game State",
  description: "État complet du jeu à chaque tick",
  type: "object",
  properties: {
    gameId: {
      type: "string",
      description: "ID unique de la partie",
    },
    tick: {
      type: "integer",
      minimum: 0,
      description: "Numéro du tick courant",
    },
    timestamp: {
      type: "integer",
      description: "Timestamp Unix en millisecondes",
    },
    players: {
      type: "object",
      patternProperties: {
        "^[a-f0-9]{24}$": {
          type: "object",
          properties: {
            position: {
              type: "object",
              properties: {
                x: { type: "integer", minimum: 0 },
                y: { type: "integer", minimum: 0 },
              },
              required: ["x", "y"],
            },
            direction: {
              type: "string",
              enum: ["UP", "DOWN", "LEFT", "RIGHT"],
            },
            alive: {
              type: "boolean",
            },
            color: {
              type: "string",
              pattern: "^#[0-9A-Fa-f]{6}$",
            },
          },
          required: ["position", "direction", "alive", "color"],
        },
      },
    },
    trails: {
      type: "object",
      description: "Map des trails par joueur: {playerId: [[x,y], [x,y]]}",
      patternProperties: {
        "^[a-f0-9]{24}$": {
          type: "array",
          items: {
            type: "array",
            items: { type: "integer" },
            minItems: 2,
            maxItems: 2,
          },
        },
      },
    },
  },
  required: ["gameId", "tick", "timestamp", "players", "trails"],
};

const jsonData = game_json.body;

const MongooseSchema = generateSchema.mongoose(jsonData);

const GameSchema = new Mongoose.Schema(MongooseSchema);

export const Game = Mongoose.model("Game", GameSchema);
