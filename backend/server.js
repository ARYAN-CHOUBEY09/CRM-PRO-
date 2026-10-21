const mongoose = require("mongoose");
const app = require("./src/app");
const { env } = require("./src/config/env");
const { startAutomationScheduler } = require("./src/services/automationService");
const connectDatabase = require("./src/config/db");

const connectWithTimeout = async (timeoutMs = 5000) => {
  const databaseAttempt = connectDatabase()
    .then(() => ({ ok: true }))
    .catch((error) => ({ ok: false, error }));

  const timeoutAttempt = new Promise((resolve) => {
    setTimeout(
      () => resolve({ ok: false, error: new Error("MongoDB connection timeout") }),
      timeoutMs,
    );
  });

  const result = await Promise.race([databaseAttempt, timeoutAttempt]);

  if (!result.ok) {
    throw result.error;
  }
}

const startServer = async () => {
  try {
    let databaseReady = false;

    try {
      await connectWithTimeout();
      databaseReady = true;
      startAutomationScheduler();
    } catch (error) {
      if (env.nodeEnv === "production") {
        throw error;
      }

      console.warn(
        `MongoDB unavailable. Starting backend in demo mode: ${error.message}`,
      );
    }

    const server = app.listen(env.port, () => {
      console.log(
        `Backend API running on port ${env.port} in ${env.nodeEnv} mode${
          databaseReady ? "" : " (demo mode)"
        }`,
      );
    });

    server.on("error", (error) => {
      console.error(`Failed to listen on port ${env.port}: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start backend server:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing backend services...`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
