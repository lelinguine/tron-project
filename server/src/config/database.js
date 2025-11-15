import mongoose from "mongoose";

const MONGODB_URI = "mongodb://127.0.0.1:27017/tron_game";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("nous sonnes connectés à la base de données");
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("une erreur est survenue:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(" MongoDB error:", err);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});
