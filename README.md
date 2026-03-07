# 🚀 Gemini Clone — Full-Stack AI Chat App

A production-grade AI chat interface inspired by **Google Gemini**. This project features a modern, responsive React frontend powered by a secure Node.js backend that interfaces with the **Google Generative AI (Gemini) SDK**.

Built with ❤️ by **Sarvadnya**.

---

## 📸 Screenshots

| Home Interface | Chat Experience | Sidebar Navigation |
| :--- | :--- | :--- |
| ![Home](./screenshots/home.png) | ![Chat](./screenshots/chat.png) | ![Sidebar](./screenshots/sidebar.png) |

---

## 🌟 Key Features

* **🎨 Gemini-Inspired UI:** A clean, minimalist interface with fluid animations and transitions.
* **💬 Suggested Prompts:** Quick-start cards to help users interact with the AI immediately.
* **🧠 Global State Management:** Built using the **React Context API** for seamless data flow across the app.
* **📁 Persistent Sidebar:** Animated drawer for managing and viewing recent chat history.
* **📱 Responsive Design:** Fully optimized for mobile, tablet, and desktop views.
* **🔐 Secure Architecture:** A dedicated Node.js backend acts as a proxy to keep your **Gemini API Key** hidden from the client side.
* **🎙️ Voice Features:** Integrated Web Speech API for voice-to-text input and SpeechSynthesis for text-to-speech output.
* **🚦 Robust Error Handling:** Graceful UI fallbacks and clear messaging during API or network failures.

---

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Context API
* CSS3 (Modules & Animations)
* Web Speech API (Voice Input/TTS)

**Backend:**
* Node.js & Express
* Google Generative AI SDK
* Dotenv (Environment Management)
* CORS (Cross-Origin Resource Sharing)

---

## 📂 Project Structure

```text
gemini-clone/
├── backend/                # Express Server
│   ├── server.js           # Entry point & API routes
│   ├── gemini.js           # Gemini SDK Configuration
│   └── .env                # Backend secrets (API Key)
├── src/                    # React Frontend
│   ├── components/         # UI Components (Main, Sidebar, etc.)
│   ├── context/            # Context API logic
│   ├── assets/             # Images and Icons
│   ├── config/             # Frontend config
│   └── App.jsx             # Main App entry
├── .env                    # Frontend environment variables
└── package.json            # Scripts and dependencies

⚙️ Installation & Setup
1. Clone the Repository
Bash
git clone [https://github.com/your-username/gemini-clone.git](https://github.com/your-username/gemini-clone.git)
cd gemini-clone
2. Backend Configuration
Navigate to the backend folder and install dependencies:

Bash
cd backend
npm install
Create a .env file in the backend/ directory:

Ini, TOML
GEMINI_API_KEY=your_google_api_key_here
PORT=5000
Start the backend:

Bash
npm start
3. Frontend Configuration
Navigate back to the root directory and install dependencies:

Bash
cd ..
npm install
Create a .env file in the root directory:

Ini, TOML
VITE_API_BASE_URL=http://localhost:5000
Start the frontend:

Bash
npm run dev
🔌 API Documentation
POST /api/chat
Proxies the user prompt to the Google Gemini API.

Request Body:

JSON
{
  "prompt": "Explain how quantum computing works."
}
Successful Response:

JSON
{
  "response": "Quantum computing uses qubits to..."
}
Note: We use a backend proxy to prevent CORS issues and to ensure the API Key is never exposed in the browser's "Network" tab.

🚀 Deployment Guide
Frontend (Vercel/Netlify)
Push your code to GitHub.

Connect your repo to Vercel.

Set the Environment Variable: VITE_API_BASE_URL to your deployed backend URL.

Build command: npm run build, Output directory: dist.

Backend (Render/Railway)
Create a new Web Service.

Set the Build Command: npm install.

Set the Start Command: node server.js.

Add your GEMINI_API_KEY and PORT in the service's Environment Variables.

🛡️ Security Best Practices
Never commit your .env files to GitHub (added to .gitignore).

Use Rate Limiting on the backend to prevent API abuse.

Always validate the prompt length and content on the server side.

Use the MOCK_STREAM=true environment variable during UI testing to save on API quota.

🎯 Future Roadmap
[ ] Streaming Responses: Implement chunked data transfer for real-time typing effects.

[ ] Markdown Support: Better rendering for code blocks and formatting.

[ ] Dark Mode: Add a theme toggle for low-light environments.

[ ] Image Analysis: Integrate Gemini-Pro-Vision for image-to-text capabilities.

[ ] Auth: User login to sync chat history across devices.

📜 License
Distributed under the MIT License. See LICENSE for more information.

Author: Sarvadnya
