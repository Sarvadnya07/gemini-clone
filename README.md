# Gemini Clone - AI Assistant

![Gemini Clone Banner](./Gemini.png)

[![Live Demo](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge&logo=vercel)](https://gemini-clone-mu-lyart.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

Live Link: [https://gemini-clone-mu-lyart.vercel.app/](https://gemini-clone-mu-lyart.vercel.app/)

Gemini Clone is a full-stack AI chat application inspired by Google Gemini. It includes a React + Vite frontend, a secure Express backend proxy, voice features, markdown rendering, and optional Firebase/MongoDB integrations.

## Features

- Clean, responsive chat interface with animated interactions
- Voice input and speech output support
- Markdown and code block rendering for AI responses
- File/image attachment handling in chat flow
- Backend API proxy to keep Gemini credentials server-side
- Rate limiting and security middleware on server routes

## Tech Stack

### Frontend

- React 18
- Vite
- Framer Motion
- React Markdown
- React Syntax Highlighter

### Backend

- Node.js
- Express
- @google/generative-ai
- Helmet, CORS, Morgan, Winston
- Express Rate Limit

### Optional Integrations

- Firebase (client + admin)
- MongoDB (Mongoose)

## Project Structure

```text
gemini-clone/
|-- src/                # Frontend source
|-- public/             # Static assets
|-- server.js           # Express server entry
|-- gemini.js           # Gemini integration logic
|-- .env.example        # Environment template
|-- package.json        # Scripts and dependencies
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and provide values for the variables you need.

Minimum required for local chat:

```ini
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run the app

Use two terminals during development:

Terminal 1 (backend):

```bash
npm run server
```

Terminal 2 (frontend):

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run server` - Start Express backend
- `npm run start` - Start backend (same as `server`)
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest

## API

### `POST /api/chat`

Sends user prompts (and optional attachments) to Gemini through the backend proxy.

Example payload:

```json
{
  "prompt": "Explain quantum entanglement in simple terms",
  "attachments": [
    { "data": "data:image/png;base64,...", "name": "image.png" }
  ]
}
```

## Security Notes

- Keep `.env` out of version control
- Do not expose `GEMINI_API_KEY` in frontend code
- Restrict CORS origins in production via `ALLOWED_ORIGINS`
- Configure Firebase/MongoDB credentials only if those modules are used

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).

## Author

[Sarvadnya](https://github.com/Sarvadnya07)
