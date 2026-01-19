// Lightweight event logger stored in localStorage for dev/diagnostics
const EVENTS_KEY = 'gemini_events';

export function logEvent(name, payload = {}) {
  try {
    const entry = { id: Date.now().toString(), name, payload, ts: new Date().toISOString() };
    const raw = localStorage.getItem(EVENTS_KEY) || '[]';
    const arr = JSON.parse(raw);
    arr.push(entry);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
    // Also console.log for convenience
    // eslint-disable-next-line no-console
    console.log('[analytics]', entry);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to log analytics event', e);
  }
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default { logEvent, getEvents };
