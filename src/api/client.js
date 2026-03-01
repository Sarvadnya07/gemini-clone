// Lightweight API client wrapper to centralize requests and allow mocking
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')) ||
  'http://localhost:5000';

export async function streamChat({ prompt, image, config } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image, config }),
  });
  return res;
}

export async function sendChat({ prompt, image, config } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image, config }),
  });
  return res.json();
}

export default {
  streamChat,
  sendChat,
};
