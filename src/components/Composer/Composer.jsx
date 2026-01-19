import React, { useCallback, useRef, useContext, useState } from 'react';
import './Composer.css';
import Lightbox from '../Lightbox/Lightbox';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

const Composer = () => {
  const { input, setInput, onSent, loading, attachments, setAttachments } = useContext(Context);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!loading) onSent();
      }
    },
    [onSent, loading]
  );

  const handleSendClick = useCallback((e) => {
    e?.preventDefault();
    if (!loading) onSent();
  }, [onSent, loading]);

  const handleGalleryClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Voice recognition (Web Speech API)
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
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const MAX = 5 * 1024 * 1024;
    const readers = files.map((file) => new Promise((resolve) => {
      if (file.size > MAX) return resolve(null);
      const reader = new FileReader();
      reader.onloadend = () => resolve({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, data: reader.result, name: file.name });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((results) => {
      const valid = results.filter(Boolean);
      if (valid.length !== results.length) alert('Some files were skipped (max 5MB each)');
      if (valid.length) setAttachments((prev) => [...prev, ...valid]);
    });
  }, [setAttachments]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    const MAX = 5 * 1024 * 1024;
    const readers = files.map((file) => new Promise((resolve) => {
      if (file.size > MAX) return resolve(null);
      const reader = new FileReader();
      reader.onloadend = () => resolve({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, data: reader.result, name: file.name });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((results) => {
      const valid = results.filter(Boolean);
      if (valid.length !== results.length) alert('Some files were skipped (max 5MB each)');
      if (valid.length) setAttachments((prev) => [...prev, ...valid]);
    });
  }, [setAttachments]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const MAX = 5 * 1024 * 1024;
    const readers = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          readers.push(new Promise((resolve) => {
            if (file.size > MAX) return resolve(null);
            const reader = new FileReader();
            reader.onloadend = () => resolve({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, data: reader.result, name: file.name });
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          }));
        }
      }
    }
    if (!readers.length) return;
    Promise.all(readers).then((results) => {
      const valid = results.filter(Boolean);
      if (valid.length !== results.length) alert('Some pasted images were skipped (max 5MB each)');
      if (valid.length) { setAttachments((prev) => [...prev, ...valid]); e.preventDefault(); }
    });
  }, [setAttachments]);

  const openLightbox = (items, index = 0) => setLightboxSrc({ items, index });
  const closeLightbox = () => setLightboxSrc(null);

  return (
    <div className={`composer ${dragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      {attachments && attachments.length > 0 && (
        <div className="composer-image-preview-multi">
          {attachments.map((att, idx) => {
            const isImage = typeof att.data === 'string' && att.data.indexOf('data:image') === 0;
            return (
              <div key={att.id} className="composer-image-item">
                {isImage ? (
                  <img src={att.data} alt={`${att.name || `Attachment ${idx + 1}`}`} onClick={() => openLightbox(attachments, idx)} />
                ) : (
                  <div className="composer-file-card">
                    <div className="composer-file-icon">📄</div>
                    <div className="composer-file-meta">
                      <div className="composer-file-name">{att.name || `file-${idx + 1}`}</div>
                      <a className="composer-file-download" href={att.data} download={att.name || ''}>Download</a>
                    </div>
                  </div>
                )}
                <div className="composer-image-actions">
                  <a className="composer-image-download" href={att.data} download={att.name || ''}>Download</a>
                  <button className="composer-image-remove" onClick={() => setAttachments((prev) => prev.filter((p) => p.id !== att.id))} aria-label="Remove image">×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightboxSrc && (
        <Lightbox items={lightboxSrc.items} initialIndex={lightboxSrc.index} alt="Attachment preview" onClose={closeLightbox} />
      )}

      <div className="composer-row">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Enter a prompt here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          aria-label="Message input"
          rows={1}
        />

        <div className="composer-actions">
          <input
            type="file"
            accept="*/*"
            hidden
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="composer-icon-btn"
            onClick={handleGalleryClick}
            title="Upload files"
            aria-label="Upload files"
          >
            <img src={assets.gallery_icon} alt="Upload" />
          </button>

          <button
            type="button"
            className="composer-icon-btn"
            onClick={() => (listening ? stopListening() : startListening())}
            title="Use microphone"
            aria-label="Use microphone"
          >
            <img src={assets.mic_icon} alt="Mic" />
          </button>

          <button
            type="button"
            className="composer-send-btn"
            onClick={handleSendClick}
            disabled={loading || (!input.trim() && (!attachments || attachments.length === 0))}
            aria-label={loading ? 'Sending…' : 'Send prompt'}
          >
            <img src={assets.send_icon} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
