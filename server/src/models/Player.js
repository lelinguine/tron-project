import { Mongoose } from "mongoose";
const generateSchema = require("generate-schema");
const player_json = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "PlayerRegistration",
  title: "Player Registration",
  description: "Schema pour l'enregistrement d'un nouveau joueur",
  type: "object",
  properties: {
    pseudo: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: "^[a-zA-Z0-9_-]+$",
      description: "Pseudo du joueur (alphanumerique, tirets, underscores)",
    },
  },
  required: ["pseudo"],
  additionalProperties: false,
};
const playerSchema = generateSchema.mongoose(player_json);

const PlayerSchema = new Mongoose.Schema(playerSchema);

export const Player = Mongoose.model("Player", PlayerSchema);
