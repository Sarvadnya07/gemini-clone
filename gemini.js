// gemini.js (ROOT, CommonJS)
require("dotenv").config();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// ---------------------------------------
// INIT (lazy)
// ---------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let defaultModel = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // Default model
    defaultModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  } catch (e) {
    // If initialization fails, keep genAI null and allow server to run (errors will surface when run is called)
    console.error('Failed to initialize GoogleGenerativeAI:', e?.message || e);
    genAI = null;
    defaultModel = null;
  }
} else {
  // No API key provided; module will still export run/runStream but will throw if called without a key.
  genAI = null;
  defaultModel = null;
}

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
  if (!genAI || !defaultModel) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment or use MOCK_STREAM for local testing.');
  }

  try {
    const chatSession = defaultModel.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const text = result?.response?.text?.();

    if (!text || typeof text !== 'string') {
      throw new Error('Empty or invalid response from Gemini');
    }

    return text;
  } catch (err) {
    console.error('🔴 Error inside gemini.run():');
    console.error(err);
    throw err;
  }
}

async function* runStream(prompt, image, config = {}) {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt must be a non-empty string");
  }

  const modelName = config.model || "gemini-2.5-flash";
  const temperature = config.temperature !== undefined ? parseFloat(config.temperature) : 1.0;

  try {
    if (!genAI) {
      throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment or use MOCK_STREAM for local testing.');
    }

    // Dynamic model instantiation
    const dynamicModel = genAI.getGenerativeModel({ model: modelName });

    const dynamicConfig = { ...generationConfig, temperature };

    const chatSession = dynamicModel.startChat({ generationConfig: dynamicConfig, safetySettings, history: [] });

    let result;
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };
      result = await chatSession.sendMessageStream([prompt, imagePart]);
    } else {
      result = await chatSession.sendMessageStream(prompt);
    }

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }

  } catch (err) {
    console.error("🔴 Error inside gemini.runStream():");
    console.error(err);
    throw err;
  }
}

module.exports = { run, runStream };
