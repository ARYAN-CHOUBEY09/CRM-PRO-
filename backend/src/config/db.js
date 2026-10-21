const mongoose = require("mongoose");

const { env } = require("./env");

const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== "production",
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  console.log("MongoDB connected successfully");
};

module.exports = connectDatabase;
