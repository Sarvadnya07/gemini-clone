require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    const logMsg = (msg) => {
        console.log(msg);
        try { fs.appendFileSync('debug_log.txt', msg + '\n'); } catch (err) { console.debug('log append failed', err); }
    };

    // Clear log file
    try { fs.unlinkSync('debug_log.txt'); } catch (err) { console.debug('log clear failed', err); }

    logMsg(`API Key loaded: ${!!apiKey}`);

    const models = ["gemini-2.5-flash", "gemini-2.5-pro"];

    for (const m of models) {
        logMsg(`\nTesting ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            logMsg(`✅ ${m} Success: ${result.response.text()}`);
        } catch (e) {
            logMsg(`❌ ${m} Failed:`);
            logMsg(e.message);
        }
    }
}

test();
