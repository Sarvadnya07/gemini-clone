import { useCallback, useRef, useContext, useState, useEffect } from 'react';
import './Composer.css';
import Lightbox from '../Lightbox/Lightbox';
import { Context } from '../../context/context';

const Composer = () => {
  const { input, setInput, onSent, loading, attachments, setAttachments } = useContext(Context);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 208) + 'px'; // max-h-52 = 208px
  }, [input]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!loading) onSent();
      }
    },
    [onSent, loading]
  );

  const handleSendClick = useCallback(
    (e) => {
      e?.preventDefault();
      if (!loading) onSent();
    },
    [onSent, loading]
  );

  const handleGalleryClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Voice recognition
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let transcript = '';
      for (let i = 0; i < ev.results.length; i += 1) {
        transcript += ev.results[i][0].transcript;
      }
      setInput((prev) => `${prev} ${transcript}`.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [setInput]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const processFiles = useCallback(
    (files) => {
      const MAX = 5 * 1024 * 1024;
      const readers = files.map(
        (file) =>
          new Promise((resolve) => {
            if (file.size > MAX) return resolve(null);
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve({
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                data: reader.result,
                name: file.name,
              });
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          })
      );
      Promise.all(readers).then((results) => {
        const valid = results.filter(Boolean);
        if (valid.length !== results.length)
          alert('Some files were skipped (max 5MB each)');
        if (valid.length) setAttachments((prev) => [...prev, ...valid]);
      });
    },
    [setAttachments]
  );

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) processFiles(files);
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = [];
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].type.indexOf('image') === 0) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) {
        e.preventDefault();
        processFiles(files);
      }
    },
    [processFiles]
  );

  const openLightbox = (items, index = 0) => setLightboxSrc({ items, index });
  const closeLightbox = () => setLightboxSrc(null);

  const hasContent = input.trim() || (attachments && attachments.length > 0);

  return (
    <div
      className={`composer ${dragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Attachment previews */}
      {attachments && attachments.length > 0 && (
        <div className="composer-attachments">
          {attachments.map((att, idx) => {
            const isImage =
              typeof att.data === 'string' && att.data.indexOf('data:image') === 0;
            return (
              <div key={att.id} className="composer-att-item">
                {isImage ? (
                  <img
                    src={att.data}
                    alt={att.name || `Attachment ${idx + 1}`}
                    onClick={() => openLightbox(attachments, idx)}
                  />
                ) : (
                  <div className="composer-file-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                    <span>{att.name || `file-${idx + 1}`}</span>
                  </div>
                )}
                <button
                  className="composer-att-remove"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((p) => p.id !== att.id))
                  }
                  aria-label="Remove attachment"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {lightboxSrc && (
        <Lightbox
          items={lightboxSrc.items}
          initialIndex={lightboxSrc.index}
          alt="Attachment preview"
          onClose={closeLightbox}
        />
      )}

      {/* Input Row */}
      <div className="composer-row">
        {/* Image upload button */}
        <button
          type="button"
          className="composer-icon-btn"
          onClick={handleGalleryClick}
          title="Upload files"
          aria-label="Upload files"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <input type="file" accept="*/*" hidden multiple ref={fileInputRef} onChange={handleFileChange} />

        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Ask Gemini..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          aria-label="Message input"
          rows={1}
        />

        {/* Mic button */}
        <button
          type="button"
          className={`composer-icon-btn ${listening ? 'listening' : ''}`}
          onClick={() => (listening ? stopListening() : startListening())}
          title="Use microphone"
          aria-label="Use microphone"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Send button */}
        <button
          type="button"
          className={`composer-send-btn ${hasContent ? 'active' : ''}`}
          onClick={handleSendClick}
          disabled={loading || !hasContent}
          aria-label={loading ? 'Sending...' : 'Send prompt'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Composer;
