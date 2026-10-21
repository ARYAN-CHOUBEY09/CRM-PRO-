const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const nodeEnv = process.env.NODE_ENV || "development";
const requiredVariables =
  nodeEnv === "production" ? ["MONGODB_URI", "JWT_SECRET"] : [];

requiredVariables.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
});

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "development-demo-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpTlsRejectUnauthorized:
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFromName: process.env.EMAIL_FROM_NAME || "Orbit CRM",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
};

module.exports = { env };
