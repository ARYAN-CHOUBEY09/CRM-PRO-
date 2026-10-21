const nodemailer = require("nodemailer");

const { env } = require("../config/env");

const normalizeValue = (value) => String(value || "").trim();

const createTransporter = () => {
  const smtpHost = normalizeValue(env.smtpHost);
  const smtpUser = normalizeValue(env.smtpUser);
  const smtpPass = normalizeValue(env.smtpPass).replace(/\s+/g, "");
  const emailFromAddress = normalizeValue(env.emailFromAddress);

  if (!smtpHost || !smtpUser || !smtpPass || !emailFromAddress) {
    throw new Error("SMTP configuration is incomplete. Please update backend/.env");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: env.smtpTlsRejectUnauthorized,
    },
  });
};

const renderTemplate = (content, variables = {}) =>
  String(content).replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const normalizedKey = key.trim();
    return variables[normalizedKey] ?? "";
  });

const sendEmail = async ({ to, subject, body }) => {
  const transporter = createTransporter();
  const emailFromName = normalizeValue(env.emailFromName || "Orbit CRM");
  const emailFromAddress = normalizeValue(env.emailFromAddress);

  try {
    return await transporter.sendMail({
      from: `"${emailFromName}" <${emailFromAddress}>`,
      to: normalizeValue(to),
      subject: String(subject || "").trim(),
      html: String(body || "").replace(/\n/g, "<br />"),
    });
  } catch (error) {
    const normalizedMessage = String(error.message || "");

    if (
      normalizedMessage.includes("Invalid login") ||
      normalizedMessage.includes("Username and Password not accepted")
    ) {
      throw new Error(
        "Gmail SMTP login failed. Recheck SMTP_USER and Google App Password in backend/.env",
      );
    }

    if (normalizedMessage.includes("Missing credentials")) {
      throw new Error(
        "SMTP credentials missing. Please recheck backend/.env values.",
      );
    }

    if (normalizedMessage.includes("self-signed certificate")) {
      throw new Error(
        "SMTP TLS certificate validation failed. Set SMTP_TLS_REJECT_UNAUTHORIZED=false only when your hosting network injects a trusted proxy certificate.",
      );
    }

    throw error;
  }
};

module.exports = {
  renderTemplate,
  sendEmail,
};
