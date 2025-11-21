🚀 Gemini Clone — AI Chat App (React + Vite + Node + Gemini API)

A modern, responsive, production-grade AI chat interface inspired by Google Gemini, built using React (Vite) on the frontend and Node.js + Express + Google Generative AI SDK on the backend.

Built by Sarvadnya Suneet Sonkambale.

📸 Screenshots

(Add your images into /screenshots and replace paths below)

Home	Chat	Sidebar

	
	
🌟 Features
🎨 Modern Chat UI

Fast, beautiful layout inspired by Google Gemini.

💬 Suggested Prompt Cards

Quick prompt starters to test AI easily.

🧠 Context API State Management

Centralized state for messages, input, loading, and errors.

📁 Sidebar with Recent Chats

Dynamic, scrollable, mobile-optimized sidebar with animations.

📱 Fully Responsive

Adaptive layout with mobile drawer animations.

🔐 Secure Node.js Backend

Express server acts as a proxy → API key stays hidden.

⚙ Environment Variable Support

Full .env system for backend and Vite frontend.

🚦 Robust Error Handling

Friendly fallback responses when model fails.

♿ Accessibility

Keyboard navigation

Focus-visible outlines

ARIA-friendly components

🧩 Extendable (Optional Features)

LocalStorage chat history

Typing animation

Streaming responses

Voice input support

Image upload support

📂 Project Structure
gemini-clone/
│
├── backend/
│   ├── server.js
│   ├── gemini.js
│   ├── package.json
│   └── .env
│
├── src/
│   ├── components/
│   │   ├── Main/
│   │   │   ├── Main.jsx
│   │   │   └── Main.css
│   │   └── Sidebar/
│   │       ├── Sidebar.jsx
│   │       └── Sidebar.css
│   │
│   ├── context/
│   │   └── context.jsx
│   │
│   ├── assets/
│   ├── config/
│   │   └── gemini.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env (frontend)
├── package.json
└── README.md

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/gemini-clone.git
cd gemini-clone

🖥️ Frontend Setup (React + Vite)
npm install
npm run dev


Frontend runs at:
👉 http://localhost:5173

Frontend .env

Create a .env file in root:

VITE_API_BASE_URL=http://localhost:5000

🛠️ Backend Setup (Node.js + Express)

Navigate to backend folder:

cd backend
npm install

Backend .env
GEMINI_API_KEY=your_google_api_key_here
PORT=5000

Run backend
npm start


Backend runs at:
👉 http://localhost:5000

🔌 API Route (Backend → Gemini)
POST /api/chat

Request:

{
  "prompt": "Explain neural networks."
}


Response:

{
  "response": "Neural networks are..."
}

🔒 Why Backend Is Required

❌ Never expose Gemini API keys in React.
✔ The backend acts as a secure wrapper around Google Generative AI.

Prevents theft of API key

Allows rate limiting

Allows access control

Enables logging & monitoring

🚀 Deployment Guide
⭐ Frontend → Vercel

Push project to GitHub

Import repo in Vercel

Set environment variable:

VITE_API_BASE_URL=https://your-backend-url.onrender.com


Build output:

dist


Deploy

⭐ Backend → Render (recommended)

Create new Web Service

Connect GitHub repo or upload backend folder

Set:

Build command

npm install


Start command

node server.js


Environment Variables

GEMINI_API_KEY=your_key
PORT=5000


Deploy

Copy URL and update your Vercel frontend .env

🧪 Development Scripts
Frontend
npm run dev
npm run build
npm run preview

Backend
npm start

🛡 Security Notes

API keys must never appear in frontend code

Always use backend proxy

Enable CORS properly

Add rate limiting in production

Use .env (not committed to GitHub!)

🎯 Future Improvements

AI message streaming

Markdown rendering

Chat export (PDF / TXT)

Multi-modal input (images + audio)

Login system + cloud chat sync

📜 License

MIT — free for personal & commercial use.

👨‍💻 Author

Sarvadnya Suneet Sonkambale
