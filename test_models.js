require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // There isn't a direct listModels on the client in some versions,
        // but let's try to just run a simple prompt on a few candidates.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        console.log("Testing models...");

        for (const m of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("Hello");
                console.log(`✅ ${m} is working.`);
            } catch (e) {
                console.log(`❌ ${m} failed:`);
                console.log(e.message);
                console.log(JSON.stringify(e, null, 2));
            }
        }

    } catch (e) {
        console.error(e);
    }
}

listModels();
