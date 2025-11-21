// gemini.js (ROOT, CommonJS)
require("dotenv").config();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// ---------------------------------------
// INIT
// ---------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use one of the models from your list:
// e.g. models/gemini-2.5-flash  ->  "gemini-2.5-flash"
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // 🚀 fast, modern, supports generateContent
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// ---------------------------------------
// MAIN RUN FUNCTION
// ---------------------------------------
async function run(prompt) {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt must be a non-empty string");
  }

  try {
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const text = result?.response?.text?.();

    if (!text || typeof text !== "string") {
      throw new Error("Empty or invalid response from Gemini");
    }

    return text;
  } catch (err) {
    console.error("🔴 Error inside gemini.run():");
    console.error(err);
    throw err; // let server.js send 500
  }
}

module.exports = run;
