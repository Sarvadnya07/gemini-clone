/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';
import './Lightbox.css';

// items: optional array of { src, name }
export default function Lightbox ({ src, alt, items, initialIndex = 0, onClose, downloadName }) {
  const [index, setIndex] = useState(initialIndex || 0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft') setIndex((i) => i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Normalize items: if `items` passed use it, otherwise create single-item from src
  const normalized = items && items.length ? items : (src ? [{ src, name: downloadName || alt }] : []);
  if (!normalized || normalized.length === 0) return null;

  // clamp index
  const idx = Math.max(0, Math.min(index, normalized.length - 1));

  useEffect(() => {
    setIndex(initialIndex || 0);
  }, [initialIndex, src, items]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, normalized.length - 1)), [normalized.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [normalized.length]);

  const current = normalized[idx];
  const currentSrc = current.src;
  const name = current.name || currentSrc;

  const isDataUrl = typeof currentSrc === 'string' && currentSrc.startsWith('data:');
  const isImage = isDataUrl ? currentSrc.indexOf('data:image') === 0 : /\.(jpe?g|png|gif|webp|avif|bmp)$/i.test(name);
  const isAudio = isDataUrl ? currentSrc.indexOf('data:audio') === 0 : /\.(mp3|wav|ogg|m4a)$/i.test(name);
  const isVideo = isDataUrl ? currentSrc.indexOf('data:video') === 0 : /\.(mp4|webm|ogg)$/i.test(name);

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-media">
          {isImage && <img src={currentSrc} alt={alt || name || 'attachment'} className="lightbox-image" />}
          {isAudio && <audio controls src={currentSrc} className="lightbox-audio" />}
          {isVideo && <video controls src={currentSrc} className="lightbox-video" />}
          {!isImage && !isAudio && !isVideo && (
            <div className="lightbox-file-card">
              <div className="lightbox-file-icon">📄</div>
              <div className="lightbox-file-name">{name}</div>
              <a className="lightbox-download" href={currentSrc} download={name || ''}>Download</a>
            </div>
          )}
        </div>

        <div className="lightbox-actions">
          <div className="lightbox-nav">
            <button onClick={prev} disabled={idx === 0} aria-label="Previous">◀</button>
            <span className="lightbox-counter">{idx + 1} / {normalized.length}</span>
            <button onClick={next} disabled={idx === normalized.length - 1} aria-label="Next">▶</button>
          </div>
          <div className="lightbox-controls">
            <a className="lightbox-download" href={currentSrc} download={name || ''}>Download</a>
            <button className="lightbox-close" onClick={onClose} aria-label="Close">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
