# 🚀 Gemini Clone — AI Chat App (React + Vite + Node + Gemini API)

A modern, responsive, production-grade AI chat interface inspired by **Google Gemini**, built using **React (Vite)** on the frontend and **Node.js + Express + Google Generative AI SDK** on the backend.

Built by **Sarvadnya Suneet Sonkambale**.

---

## 📸 Screenshots

> *(Place images in `/screenshots` and update paths)*

| Home | Chat | Sidebar |
|------|------|---------|
| ![](./screenshots/home.png) | ![](./screenshots/chat.png) | ![](./screenshots/sidebar.png) |

---

# 🌟 Features

### 🎨 Modern Chat UI  
Clean, Gemini-style interface with animations.

### 💬 Suggested Prompt Cards  
Quick AI starters inspired by Google's UI.

### 🧠 Context API State Management  
Centralized chat state for smooth UX.

### 📁 Sidebar with Recent Chats  
Animated, scrollable recent chat list.

### 📱 Fully Responsive  
Mobile-first design with drawer sidebar.

### 🔐 Secure Node.js Backend  
Protects Gemini API keys behind Express server.

### ⚙ Environment Variable Support  
Complete `.env` support for both frontend and backend.

### 🚦 Error Handling  
Elegant fallbacks when API fails.

### ♿ Accessibility  
Focus outlines, keyboard navigation, ARIA support.

### 🧩 Extendable (Optional)
- LocalStorage chat history  
- Typing animation  
- Streaming responses  
- Voice input  
- Image upload  

---

# 📂 Project Structure

gemini-clone/
│
├── backend/
│ ├── server.js
│ ├── gemini.js
│ ├── package.json
│ └── .env
│
├── src/
│ ├── components/
│ │ ├── Main/
│ │ │ ├── Main.jsx
│ │ │ └── Main.css
│ │ └── Sidebar/
│ │ ├── Sidebar.jsx
│ │ └── Sidebar.css
│ │
│ ├── context/
│ │ └── context.jsx
│ │
│ ├── assets/
│ ├── config/
│ │ └── gemini.js
│ ├── App.jsx
│ ├── App.css
│ ├── index.css
│ └── main.jsx
│
├── .env (frontend)
├── package.json
└── README.md

yaml
Copy code

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```sh
git clone https://github.com/your-username/gemini-clone.git
cd gemini-clone
🖥️ Frontend Setup (React + Vite)
sh
Copy code
npm install
npm run dev
Frontend runs at:
👉 http://localhost:5173

Frontend .env
ini
Copy code
VITE_API_BASE_URL=http://localhost:5000
🛠️ Backend Setup (Node.js + Express)
Navigate to backend:

sh
Copy code
cd backend
npm install
Backend .env
ini
Copy code
GEMINI_API_KEY=your_google_api_key_here
PORT=5000
Run backend
sh
Copy code
npm start
Backend runs at:
👉 http://localhost:5000

🔌 API Route (Backend → Gemini)
POST /api/chat
Request:

json
Copy code
{
  "prompt": "Explain neural networks."
}
Response:

json
Copy code
{
  "response": "Neural networks are..."
}
🔒 Why Backend Is Required
❌ Never expose Gemini API keys in React.
✔ Backend proxy = safe, stable, expandable.

Advantages:

API key protection

Rate limiting

Access control

Logging & monitoring

Removes CORS complexity

🚀 Deployment Guide
⭐ Frontend → Vercel
Push repo to GitHub

Import into Vercel

Set environment variable:

ini
Copy code
VITE_API_BASE_URL=https://your-backend.onrender.com
Build output folder:

nginx
Copy code
dist
Deploy 🎉

⭐ Backend → Render (recommended)
Create new Web Service

Connect GitHub repo / upload backend

Add:

Build command

nginx
Copy code
npm install
Start command

nginx
Copy code
node server.js
Environment Variables

ini
Copy code
GEMINI_API_KEY=your_key
PORT=5000
Deploy

Copy backend URL → update frontend .env

🧪 Development Scripts
Frontend
sh
Copy code
npm run dev
npm run build
npm run preview
Backend
sh
Copy code
npm start
🛡 Security Notes
Never expose API keys in frontend

Use .env files

Always use backend proxy

Enable CORS safely

Add rate limiting for production

Do not commit .env to GitHub

🎯 Future Improvements
AI streaming responses

Typing indicator

Chat export (PDF/TXT)

Markdown rendering

Dark mode toggle

Audio & image input

Login support with cloud sync

📜 License
MIT — free for personal & commercial use.

👨‍💻 Author
Sarvadnya Suneet Sonkambale

yaml
Copy code
