// server.js (ROOT, CommonJS)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const run = require("./gemini");

const app = express();

// ---------------------------------------
// CONFIG
// ---------------------------------------
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

// ---------------------------------------
// MIDDLEWARE
// ---------------------------------------
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Basic logging (optional)
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

// ---------------------------------------
// HEALTH CHECK ROUTE
// ---------------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Gemini backend is running",
    time: new Date().toISOString(),
  });
});

// ---------------------------------------
// MAIN CHAT ROUTE
// ---------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Invalid prompt. Expected a non-empty string.",
      });
    }

    console.log(`🔵 Incoming prompt: "${prompt}"`);

    const reply = await run(prompt);

    res.json({
      success: true,
      response: reply,
    });
  } catch (error) {
    console.error("🔴 Gemini server error:");
    console.error(error);
    console.error(error?.response?.data || error?.message);

    res.status(500).json({
      success: false,
      error: "Gemini API error",
      details: error?.message || "Unknown error",
    });
  }
});

// ---------------------------------------
// START SERVER
// ---------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Gemini backend running at: http://localhost:${PORT}`);
  console.log(`📡 CORS allowed origin: ${FRONTEND_ORIGIN}`);
});
