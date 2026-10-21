require("express-async-errors");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const { env } = require("./config/env");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

