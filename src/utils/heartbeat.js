/**
 * Heartbeat utility to prevent backend cold starts on free hosting tiers (e.g., Render, Railway).
 * Pings the /health endpoint every 10 minutes.
 */
const startHeartbeat = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const INTERVAL = 10 * 60 * 1000; // 10 minutes

  const ping = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        console.log('💓 Heartbeat: Backend is alive');
      }
    } catch (e) {
      console.warn('💓 Heartbeat: Failed to reach backend', e);
    }
  };

  // Ping immediately and then set interval
  ping();
  return setInterval(ping, INTERVAL);
};

export default startHeartbeat;
