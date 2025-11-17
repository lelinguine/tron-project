import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/tron_game";

export const connectDatabase = async () => {
  const uri = DEFAULT_URI;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`Connecté à la base MongoDB (${mongoose.connection.name})`);
  } catch (error) {
    logger.error("Incapable de se connecter a MongoDB", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error", err);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed due to app termination");
  process.exit(0);
});
