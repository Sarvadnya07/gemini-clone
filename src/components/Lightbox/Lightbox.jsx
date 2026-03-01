/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useMemo } from 'react';
import './Lightbox.css';

export default function Lightbox({ src, alt, items, initialIndex = 0, onClose, downloadName }) {
  const [index, setIndex] = useState(initialIndex || 0);

  // Normalize items
  const normalized = useMemo(() => {
    if (items && items.length) return items;
    if (src) return [{ src, name: downloadName || alt }];
    return [];
  }, [items, src, downloadName, alt]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, normalized.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, normalized.length]);

  useEffect(() => {
    setIndex(initialIndex || 0);
  }, [initialIndex, src, items]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, normalized.length - 1)), [normalized.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  if (!normalized.length) return null;

  const idx = Math.max(0, Math.min(index, normalized.length - 1));
  const current = normalized[idx];
  const currentSrc = current.data || current.src;
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
              <div className="lightbox-file-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              </div>
              <div className="lightbox-file-name">{name}</div>
              <a className="lightbox-download" href={currentSrc} download={name || ''}>Download</a>
            </div>
          )}
        </div>

        <div className="lightbox-actions">
          <div className="lightbox-nav">
            <button onClick={prev} disabled={idx === 0} aria-label="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="lightbox-counter">{idx + 1} / {normalized.length}</span>
            <button onClick={next} disabled={idx === normalized.length - 1} aria-label="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
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
