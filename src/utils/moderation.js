// Very small client-side moderation helper (local blacklist)
const DEFAULT_BAD_WORDS = [
  'kill', 'bomb', 'terror', 'suicide', 'hate', 'illegal'
];

export function checkContent(text, extraList = []) {
  if (!text || typeof text !== 'string') return { flagged: false };
  const combined = DEFAULT_BAD_WORDS.concat(extraList).map((w) => w.toLowerCase());
  const lower = text.toLowerCase();
  const found = combined.find((w) => lower.includes(w));
  if (found) {
    return { flagged: true, reason: `Contains suspicious word: ${found}` };
  }
  return { flagged: false };
}

export default { checkContent };
