// Lightweight TTS wrapper using the Web Speech Synthesis API
export function speak(text, opts = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('TTS not supported in this browser');
    return null;
  }

  if (!text) return null;

  const utter = new SpeechSynthesisUtterance(text);
  if (opts.lang) utter.lang = opts.lang;
  if (typeof opts.rate === 'number') utter.rate = opts.rate;
  if (typeof opts.pitch === 'number') utter.pitch = opts.pitch;
  if (typeof opts.volume === 'number') utter.volume = opts.volume;

  window.speechSynthesis.speak(utter);
  return utter;
}

export function stop() {
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

export function pause() {
  try {
    if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.pause();
  } catch {
    // ignore
  }
}

export function resume() {
  try {
    if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();
  } catch {
    // ignore
  }
}

export default { speak, stop };
