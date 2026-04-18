// server.js (ROOT, CommonJS) — Production-hardened
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { run, runStream } = require("./gemini");
const authMiddleware = require("./middleware/auth");
const { generalLimiter, chatLimiter } = require("./middleware/rateLimiter");
const { validateChatInput } = require("./middleware/validate");
const Chat = require("./models/Chat");
const logger = require("./utils/logger");

const app = express();

// ---------------------------------------
// CONFIG
// ---------------------------------------
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gemini-clone";

// Strict CORS: whitelist from env or fallback to localhost
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [FRONTEND_ORIGIN];

// ---------------------------------------
// DB CONNECTION
// ---------------------------------------
mongoose
  .connect(MONGODB_URI)
  .then(() => logger.info("🍃 Connected to MongoDB"))
  .catch((err) => logger.error("❌ MongoDB connection error", { error: err.message }));

// ---------------------------------------
// SECURITY MIDDLEWARE (Phase 1)
// ---------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Apply general rate limiter globally
app.use(generalLimiter);

// Body parser — 10mb limit for image attachments
app.use(express.json({ limit: "10mb" }));

// HTTP request logging (Morgan → Winston)
app.use(
  morgan(NODE_ENV === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// ---------------------------------------
// HEALTH CHECK ROUTE (Phase 3)
// ---------------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    env: NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    uptime: `${Math.floor(process.uptime())}s`,
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Dedicated liveness probe for deployment platforms (Render, Railway, etc.)
app.get("/health", (req, res) => {
  const isDbHealthy = mongoose.connection.readyState === 1;
  res.status(isDbHealthy ? 200 : 503).json({
    status: isDbHealthy ? "healthy" : "degraded",
    db: isDbHealthy ? "up" : "down",
  });
});

// ---------------------------------------
// MAIN CHAT ROUTE
// ---------------------------------------
app.post("/api/chat", chatLimiter, validateChatInput, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt. Expected a non-empty string." });
    }

    logger.info(`Chat request`, { promptLength: prompt.length, ip: req.ip });

    if (process.env.MOCK_STREAM === "true") {
      const simulatedReply = `Simulated reply for: ${String(prompt).slice(0, 120)}\n\nThis is a mock response used for local testing.`;
      return res.json({ success: true, response: simulatedReply });
    }

    const reply = await run(prompt);
    res.json({ success: true, response: reply });
  } catch (error) {
    logger.error("Gemini /api/chat error", { message: error?.message });
    res.status(500).json({ success: false, error: "Gemini API error", details: error?.message || "Unknown error" });
  }
});

// ---------------------------------------
// STREAMING CHAT ROUTE (REAL)
// ---------------------------------------
app.post("/api/chat/stream", chatLimiter, validateChatInput, async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const { prompt, image, config } = req.body;

  try {
    if (process.env.MOCK_STREAM === "true") {
      const simulated = [
        `Thinking about: ${String(prompt).slice(0, 120)}\n`,
        "…formulating ideas…\n",
        "Here is a short draft of a response:\n",
        `- Point one about "${String(prompt).slice(0, 40)}"\n`,
        "- Point two with an example\n",
        "\nFinal answer: This is a simulated streaming response for local testing.\n",
      ];
      for (const chunk of simulated) {
        res.write(chunk);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      res.end();
      return;
    }

    logger.info("Stream request", { promptLength: prompt?.length, ip: req.ip });
    const stream = runStream(prompt, image, config);
    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    logger.error("Stream error", { message: error?.message });
    res.write("\n\n⚠️ Error: Failed to generate response.");
    res.end();
  }
});

// ---------------------------------------
// CHAT HISTORY ROUTES (Auth-protected)
// ---------------------------------------

app.get("/api/chats", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const chats = await Chat.find({ userId: req.user.uid }).sort({ updatedAt: -1 }).select("-messages");
    res.json(chats);
  } catch (error) {
    logger.error("GET /api/chats error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/chats/:id", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const chat = await Chat.findOne({ id: req.params.id, userId: req.user.uid });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat.messages);
  } catch (error) {
    logger.error("GET /api/chats/:id error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chats", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { id, title, messages, pinned } = req.body;
  try {
    const chat = await Chat.findOneAndUpdate(
      { id, userId: req.user.uid },
      { title, messages, pinned, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(chat);
  } catch (error) {
    logger.error("POST /api/chats error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/chats/:id", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    await Chat.deleteOne({ id: req.params.id, userId: req.user.uid });
    res.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/chats/:id error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------
// GLOBAL ERROR HANDLER
// ---------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error("Unhandled Express error", { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ---------------------------------------
// START SERVER
// ---------------------------------------
app.listen(PORT, () => {
  logger.info(`🚀 Gemini backend running at: http://localhost:${PORT} [${NODE_ENV}]`);
  logger.info(`📡 CORS allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});

// ---------------------------------------
// PROCESS-LEVEL ERROR HANDLERS
// ---------------------------------------
process.on("uncaughtException", (err) => {
  logger.error("💥 Uncaught Exception", { message: err.message, stack: err.stack });
  // In production: graceful shutdown, then let process manager restart
  if (process.env.NODE_ENV === "production") process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("💥 Unhandled Rejection", { reason: String(reason) });
});
