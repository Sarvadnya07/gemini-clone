// server.js (ROOT, CommonJS) — Production-hardened
require("dotenv").config();
const Sentry = require("@sentry/node");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });
}

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const PERSONAS = require("./utils/personas");
const { run, runStream } = require("./gemini");
const authMiddleware = require("./middleware/auth");
const { generalLimiter, chatLimiter } = require("./middleware/rateLimiter");
const { validateChatInput } = require("./middleware/validate");
const Chat = require("./models/Chat");
const User = require("./models/User");
const Document = require("./models/Document");
const logger = require("./utils/logger");
const cache = require("./utils/cache");
const validateEnv = require("./utils/envValidator");
const multer = require("multer");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { chunkText, getEmbeddings, performRAG } = require("./utils/rag");
const AgentCoordinator = require("./utils/agents");
const http = require("http");
const { Server } = require("socket.io");

const upload = multer({ storage: multer.memoryStorage() });

// Validate environment variables before doing anything else
validateEnv();

const app = express();

// The request handler must be the first middleware on the app
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

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
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "https://www.gstatic.com"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://*.firebaseio.com", "https://*.googleapis.com", "https://www.google-analytics.com"],
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
// AUTO-TITLING ROUTE
// ---------------------------------------
app.post("/api/generate-title", chatLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const titlePrompt = `Generate a very short, concise title (max 5 words) for a chat that starts with this prompt: "${prompt}". Return ONLY the title text, no quotes or period.`;
    
    if (process.env.MOCK_STREAM === "true") {
      return res.json({ title: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "") });
    }

    const title = await run(titlePrompt);
    res.json({ title: title.trim() });
  } catch (error) {
    logger.error("Title generation error", { message: error.message });
    res.status(500).json({ error: "Failed to generate title" });
  }
});

// ---------------------------------------
// SMART SUGGESTIONS ROUTE
// ---------------------------------------
app.post("/api/generate-suggestions", chatLimiter, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Messages array is required" });

    const context = messages.slice(-3).map(m => `${m.role}: ${m.content}`).join("\n");
    const suggestionPrompt = `Based on the following conversation history, suggest 3 short, helpful follow-up questions or prompts the user might want to ask next. Return ONLY a JSON array of strings.
    
    HISTORY:
    ${context}
    
    JSON format: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

    if (process.env.MOCK_STREAM === "true") {
      return res.json(["Tell me more", "Explain the details", "What are the next steps?"]);
    }

    const response = await run(suggestionPrompt);
    // Cleanup potential markdown formatting
    const jsonStr = response.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(jsonStr);
    res.json(suggestions);
  } catch (error) {
    logger.error("Suggestion generation error", { message: error.message });
    res.json(["Tell me more", "Can you explain that further?", "Give me an example"]);
  }
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

    const cacheKey = `chat:${prompt}`;
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      logger.info(`Cache hit for prompt`, { promptLength: prompt.length });
      return res.json({ success: true, response: cachedResponse, cached: true });
    }

    if (process.env.MOCK_STREAM === "true") {
      const simulatedReply = `Simulated reply for: ${String(prompt).slice(0, 120)}\n\nThis is a mock response used for local testing.`;
      await cache.set(cacheKey, simulatedReply);
      return res.json({ success: true, response: simulatedReply });
    }

    const reply = await run(prompt);
    await cache.set(cacheKey, reply);
    res.json({ success: true, response: reply });
  } catch (error) {
    logger.error("Gemini /api/chat error", { message: error?.message });
    res.status(500).json({ success: false, error: "Gemini API error", details: error?.message || "Unknown error" });
  }
});

// ---------------------------------------
// MULTI-AGENT CHAT ROUTE
// ---------------------------------------
app.post("/api/chat/agents", chatLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const result = await AgentCoordinator.executeComplexTask(prompt);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error("Multi-agent route error", { message: error.message });
    res.status(500).json({ error: "Multi-agent orchestration failed" });
  }
});

// ---------------------------------------
// DOCUMENT RAG ROUTES (Auth-protected)
// ---------------------------------------
app.post("/api/documents/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let text = "";
    const mimetype = req.file.mimetype;

    if (mimetype === "application/pdf") {
      const data = await pdf(req.file.buffer);
      text = data.text;
    } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = data.value;
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from file" });
    }

    const chunks = chunkText(text);
    const embeddings = await getEmbeddings(chunks);
    
    const docChunks = chunks.map((t, i) => ({
      text: t,
      embedding: embeddings[i]
    }));

    const doc = await Document.create({
      userId: req.user.uid,
      filename: req.file.originalname,
      text: text,
      chunks: docChunks
    });

    res.json({ id: doc._id, filename: doc.filename });
  } catch (error) {
    logger.error("Document upload error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/documents", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const docs = await Document.find({ userId: req.user.uid }).select("filename createdAt");
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/documents/:id", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    await Document.deleteOne({ _id: req.params.id, userId: req.user.uid });
    res.json({ success: true });
  } catch (error) {
    logger.error("Document deletion error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------
// STREAMING CHAT ROUTE (REAL)
// ---------------------------------------
app.post("/api/chat/stream", chatLimiter, validateChatInput, async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const { prompt, image, config, docId } = req.body;

  try {
    // Inject Persona Instruction
    if (config.persona) {
      let personaInstruction = PERSONAS[config.persona]?.instruction;
      if (!personaInstruction && req.user) {
        const userDoc = await User.findOne({ userId: req.user.uid });
        const custom = userDoc?.customPersonas?.find(p => p.id === config.persona);
        if (custom) personaInstruction = custom.instruction;
      }
      if (personaInstruction) {
        config.systemInstruction = personaInstruction;
        logger.info("Persona injected", { persona: config.persona });
      }
    }

    let augmentedPrompt = prompt;

    // RAG Implementation
    if (docId && req.user) {
      try {
        const doc = await Document.findOne({ _id: docId, userId: req.user.uid });
        if (doc) {
          const context = await performRAG(prompt, doc.chunks);
          if (context) {
            augmentedPrompt = `You are an assistant answering questions based on the provided document context.\n\nDOCUMENT CONTEXT:\n${context}\n\nUSER QUESTION: ${prompt}\n\nPlease answer based ONLY on the context provided if possible. If the answer is not in the context, say so.`;
            logger.info("RAG context injected", { docId, filename: doc.filename });
          }
        }
      } catch (ragErr) {
        logger.warn("RAG retrieval failed", { message: ragErr.message });
      }
    }

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

    logger.info("Stream request", { promptLength: augmentedPrompt?.length, ip: req.ip });
    const stream = runStream(augmentedPrompt, image, config);
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
// ANALYTICS ROUTES (Auth-protected)
// ---------------------------------------
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const totalChats = await Chat.countDocuments({ userId: req.user.uid });
    const chats = await Chat.find({ userId: req.user.uid });
    
    let totalMessages = 0;
    const modelUsage = {};
    
    chats.forEach(chat => {
      totalMessages += chat.messages.length;
      chat.messages.forEach(msg => {
        if (msg.role === 'assistant') {
          const model = msg.modelA || 'unknown';
          modelUsage[model] = (modelUsage[model] || 0) + 1;
        }
      });
    });

    res.json({
      totalChats,
      totalMessages,
      modelUsage,
      activeSince: chats.length > 0 ? chats[chats.length - 1].createdAt : new Date()
    });
  } catch (error) {
    logger.error("GET /api/admin/stats error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------
// USER SETTINGS ROUTES (Auth-protected)
// ---------------------------------------
app.get("/api/user/settings", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    let user = await User.findOne({ userId: req.user.uid });
    if (!user) {
      user = await User.create({ userId: req.user.uid, email: req.user.email });
    }
    res.json(user.settings);
  } catch (error) {
    logger.error("GET /api/user/settings error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/settings", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { settings } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.user.uid },
      { settings, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(user.settings);
  } catch (error) {
    logger.error("POST /api/user/settings error", { message: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/personas", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const user = await User.findOne({ userId: req.user.uid });
    const custom = user?.customPersonas || [];
    // Return both static and custom
    res.json({
      defaults: PERSONAS,
      custom: custom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/personas", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { persona } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.user.uid },
      { $push: { customPersonas: persona } },
      { upsert: true, new: true }
    );
    res.json(user.customPersonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/user/personas/:id", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.user.uid },
      { $pull: { customPersonas: { id: req.params.id } } },
      { new: true }
    );
    res.json(user.customPersonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
// SERVE STATIC ASSETS (Production)
// ---------------------------------------
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  // Handle SPA routing
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// ---------------------------------------
// GLOBAL ERROR HANDLER
// ---------------------------------------
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// Collaborative Workspace Logic
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    logger.info(`User ${socket.id} joined room: ${chatId}`);
  });

  socket.on("send-message", ({ chatId, message }) => {
    // Broadcast to others in the same room
    socket.to(chatId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    logger.info(`🚀 Gemini backend running at: http://localhost:${PORT} [${NODE_ENV}]`);
    logger.info(`📡 CORS allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
    logger.info(`⚡ Socket.io enabled for real-time collaboration`);
  });
}

module.exports = app;

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
