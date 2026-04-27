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
import Mermaid from '../Mermaid/Mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { usePyodide } from '../../hooks/usePyodide';

// Sub-component for individual code blocks with execution support
const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');
  const isPython = language === 'python';
  
  const { runCode, loading } = usePyodide();
  const [executionResult, setExecutionResult] = useState(null);

  const handleCopy = async (e) => {
    await navigator.clipboard.writeText(code);
    const btn = e.currentTarget;
    const originalText = btn.innerText;
    btn.innerText = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('copied');
    }, 2000);
  };

  const handleRun = async () => {
    const res = await runCode(code);
    setExecutionResult(res);
  };

  if (inline || !match) {
    return <code {...props} className={className}>{children}</code>;
  }

  if (language === 'mermaid') {
    return <Mermaid chart={code} />;
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{language}</span>
        <div className="code-block-actions">
          {isPython && (
            <button 
              className="code-block-run" 
              onClick={handleRun} 
              disabled={loading}
              title="Run Python code"
            >
              {loading ? (
                <span className="loader-mini" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
              {loading ? 'Running...' : 'Run'}
            </button>
          )}
          <button className="code-block-copy" onClick={handleCopy}>
            Copy
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        {...props}
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: executionResult ? '0' : '0 0 10px 10px',
          fontSize: '14px',
        }}
      >
        {code}
      </SyntaxHighlighter>

      {executionResult && (
        <div className={`execution-output ${executionResult.error ? 'error' : ''}`}>
          <div className="output-header">
            <span>Output</span>
            <button onClick={() => setExecutionResult(null)}>✕</button>
          </div>
          <div className="output-body">
            {executionResult.stdout && <pre className="stdout">{executionResult.stdout}</pre>}
            {executionResult.result && executionResult.result !== 'undefined' && (
              <pre className="result">{executionResult.result}</pre>
            )}
            {executionResult.error && <pre className="error-text">{executionResult.error}</pre>}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for rendering Markdown with LaTeX and Mermaid support
const MarkdownContent = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

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

const Message = ({ id, role, content, contentB, modelA, modelB, image, attachments, loading, agents }) => {
  const ctx = useContext(Context) || {};
  const { retryMessage } = ctx;
  const [copied, setCopied] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const modelLabels = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
  };

  const isComparison = role === 'assistant' && contentB !== null;

  const handleCopy = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleSpeak = (text) => {
    if (!text) return;
    speak(text, { rate: 1.0 });
  };

  const openLightbox = (items, index = 0) => setLightboxSrc({ items, index });
  const closeLightbox = () => setLightboxSrc(null);

  const handleRetry = () => {
    if (!id) return;
    retryMessage(id);
  };

  return (
    <motion.div
      className={`message ${role} ${isComparison ? 'comparison' : ''}`}
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
        {/* Attachments (Always show above content) */}
        {attachments && attachments.length > 0 && (
          <div className="message-attachments">
            {attachments.map((att, idx) => {
              const data = att.data || att;
              const isImage = typeof data === 'string' && data.startsWith('data:image');
              const isAudio = typeof data === 'string' && data.startsWith('data:audio');
              const isVideo = typeof data === 'string' && data.startsWith('data:video');
              
              if (isImage) {
                return (
                  <img
                    key={att.id || idx}
                    src={data}
                    className="message-image"
                    onClick={() => openLightbox(attachments, idx)}
                    alt="User attachment"
                  />
                );
              }
              if (isAudio) {
                return (
                  <div key={att.id || idx} className="message-audio-wrapper">
                    <audio src={data} controls className="message-audio" />
                    <span className="audio-name">{att.name || 'Audio'}</span>
                  </div>
                );
              }
              if (isVideo) {
                return (
                  <div key={att.id || idx} className="message-video-wrapper">
                    <video src={data} controls className="message-video" />
                    <span className="video-name">{att.name || 'Video'}</span>
                  </div>
                );
              }
              return (
                <div key={att.id || idx} className="message-file-chip">
                  <span>{att.name || 'File'}</span>
                </div>
              );
            })}
          </div>
        )}

        {isComparison ? (
          <div className="comparison-wrapper">
            <div className="comparison-column">
              <div className="column-header">
                <span className="column-model-name">{modelLabels[modelA] || 'Model A'}</span>
                <button className="col-copy-btn" onClick={() => handleCopy(content)}>Copy</button>
              </div>
              <MarkdownContent content={content} />
            </div>
            <div className="comparison-column">
              <div className="column-header">
                <span className="column-model-name">{modelLabels[modelB] || 'Model B'}</span>
                <button className="col-copy-btn" onClick={() => handleCopy(contentB)}>Copy</button>
              </div>
              <MarkdownContent content={contentB} />
            </div>
          </div>
        ) : (
          <div className="content-wrapper">
            {role === 'user' ? (
              <div className="user-text">{content}</div>
            ) : (
              <MarkdownContent content={content} />
            )}
          </div>
        )}

        {/* Agent Steps Accordion */}
        {agents && agents.length > 0 && (
          <div className="agent-steps-wrapper">
            <details className="agent-steps-details">
              <summary className="agent-steps-summary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Thinking Process ({agents.length} agents)
              </summary>
              <div className="agent-steps-content">
                {agents.map((step, idx) => (
                  <div key={idx} className="agent-step">
                    <div className="agent-step-header">
                      <span className="agent-step-role">{step.role}</span>
                      <span className="agent-step-dot" />
                    </div>
                    <div className="agent-step-body">
                       <ReactMarkdown>{step.output}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Global actions (Simplified for comparison mode) */}
        {!isComparison && content && (
          <div className="message-actions">
            <button onClick={() => handleCopy(content)} title="Copy">
              {copied ? '✓' : 'Copy'}
            </button>
            {role === 'assistant' && (
              <>
                <button onClick={() => handleSpeak(content)}>Read Aloud</button>
                <button onClick={handleRetry}>Retry</button>
              </>
            )}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <Lightbox
          items={lightboxSrc.items}
          initialIndex={lightboxSrc.index}
          onClose={closeLightbox}
        />
      )}
    </motion.div>
  );
};

export default Message;
