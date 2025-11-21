// server.js (ROOT)
const express = require("express");
const cors = require("cors");
const run = require("./gemini");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const reply = await run(prompt);
    res.json({ response: reply });
  } catch (error) {
    console.error("Gemini server error:", error);
    res.status(500).json({ error: "Gemini API error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Gemini backend running on http://localhost:${PORT}`);
});
