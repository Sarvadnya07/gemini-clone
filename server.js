// server.js (ROOT, CommonJS)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { run, runStream } = require("./gemini");

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

    // If MOCK_STREAM is enabled, return a simulated response for local dev
    if (process.env.MOCK_STREAM === 'true') {
      const simulatedReply = `Simulated reply for: ${String(prompt).slice(0, 120)}\n\nThis is a mock response used for local testing.`;
      return res.json({ success: true, response: simulatedReply });
    }

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
// STREAMING CHAT ROUTE (REAL)
// ---------------------------------------
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  const { prompt, image, config } = req.body;

  try {
    // If MOCK_STREAM is enabled, simulate a chunked stream for local dev/testing
    if (process.env.MOCK_STREAM === 'true') {
      const simulated = [
        `Thinking about: ${String(prompt).slice(0, 120)}\n`,
        '…formulating ideas…\n',
        'Here is a short draft of a response:\n',
        `- Point one about "${String(prompt).slice(0, 40)}"\n`,
        '- Point two with an example\n',
        '\nFinal answer: This is a simulated streaming response for local testing.\n',
      ];

      for (const chunk of simulated) {
        res.write(chunk);
        // Small delay to imitate streaming
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      res.end();
      return;
    }

    // Default: use the real stream implementation
    const stream = runStream(prompt, image, config);

    for await (const chunk of stream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error("🔴 Stream error:", error);
    res.write("\n\n⚠️ Error: Failed to generate response.");
    res.end();
  }
});

// ---------------------------------------
// START SERVER
// ---------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Gemini backend running at: http://localhost:${PORT}`);
  console.log(`📡 CORS allowed origin: ${FRONTEND_ORIGIN}`);
});

// ---------------------------------------
// GLOBAL ERROR HANDLERS
// ---------------------------------------
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  // Keep the server running, but log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the server running
});
