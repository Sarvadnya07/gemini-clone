/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Message.css';
import { Context } from '../../context/context';
import { speak, stop, pause, resume } from '../../utils/tts';
import Lightbox from '../Lightbox/Lightbox';

// Animated Gemini Star SVG
const GeminiStar = ({ loading }) => (
  <div className={`gemini-star ${loading ? 'gemini-star-loading' : ''}`}>
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4b90ff" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ff5546" />
        </linearGradient>
      </defs>
      <path
        d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14C20.268 14 14 7.732 14 0z"
        fill="url(#geminiGrad)"
      />
    </svg>
  </div>
);

const Message = ({ id, role, content, image, attachments, loading }) => {
  const ctx = useContext(Context) || {};
  const { retryMessage } = ctx;
  const [copied, setCopied] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleSpeak = () => {
    if (!content) return;
    speak(content, { rate: 1.0 });
  };

  const handleStopSpeak = () => stop();
  const handlePauseSpeak = () => pause();
  const handleResumeSpeak = () => resume();

  const openLightbox = (items, index = 0) => setLightboxSrc({ items, index });
  const closeLightbox = () => setLightboxSrc(null);

  const handleRetry = () => {
    if (!id) return;
    retryMessage(id);
  };

  return (
    <motion.div
      className={`message ${role}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    >
      <div className="message-avatar">
        {role === 'user' ? (
          <div className="avatar-user">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        ) : (
          <GeminiStar loading={loading} />
        )}
      </div>
      <div className="message-body">
        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="message-attachments">
            {attachments.map((att, idx) => (
              <img
                key={att.id}
                src={att.data || att}
                alt={att.name || 'Uploaded'}
                className="message-image"
                onClick={() => openLightbox(attachments, idx)}
              />
            ))}
          </div>
        )}
        {image && <img src={image} alt="Uploaded" className="message-image" />}

        {/* Loading skeleton */}
        {loading && (!content || content.trim() === '') ? (
          <div className="message-skeleton">
            <div className="s-line" />
            <div className="s-line short" />
            <div className="s-line shorter" />
          </div>
        ) : role === 'user' ? (
          <div className="user-text">{content}</div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-block-lang">{match[1]}</span>
                        <button
                          className="code-block-copy"
                          onClick={async () => {
                            await navigator.clipboard.writeText(String(children));
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        {...props}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0 0 10px 10px',
                          fontSize: '14px',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Action buttons */}
        {content && (
          <div className="message-actions">
            <button onClick={handleCopy} aria-label="Copy message" title="Copy">
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
            </button>
            {role === 'assistant' && (
              <>
                <button onClick={handleSpeak} aria-label="Speak message" title="Read aloud">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                </button>
                <button onClick={handlePauseSpeak} aria-label="Pause" title="Pause">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                </button>
                <button onClick={handleResumeSpeak} aria-label="Resume" title="Resume">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
                <button onClick={handleStopSpeak} aria-label="Stop" title="Stop">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                </button>
                <button onClick={handleRetry} aria-label="Retry" title="Retry">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <Lightbox
          items={lightboxSrc.items}
          initialIndex={lightboxSrc.index}
          alt="Attachment preview"
          onClose={closeLightbox}
          downloadName="attachment"
        />
      )}
    </motion.div>
  );
};

export default Message;
