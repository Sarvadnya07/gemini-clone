import { useContext, useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Main.css';
import { Context } from '../../context/context';
import Message from '../Message/Message';
import Composer from '../Composer/Composer';

const SUGGESTED_CARDS = [
  {
    id: 1,
    text: 'Suggest beautiful places to see on an upcoming road trip',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    id: 2,
    text: 'Briefly summarize this concept: urban planning',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18" />
        <line x1="10" y1="14" x2="14" y2="14" />
        <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    text: 'Brainstorm team bonding activities for our work retreat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    text: 'Improve the readability of the following code',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

const Main = ({ onToggleSidebar }) => {
  const { setInput, onSent, messages, loading, config } = useContext(Context);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [modelDropdown, setModelDropdown] = useState(false);

  const handleCardClick = (text) => {
    setInput(text);
    onSent(text);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Compute last assistant message for screen-reader
  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') return messages[i].content || '';
    }
    return '';
  }, [messages]);

  const modelLabels = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
  };

  return (
    <div className="main">
      {/* Top Navigation Bar */}
      <header className="main-nav">
        <div className="main-nav-left">
          <button className="main-hamburger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="model-selector" onClick={() => setModelDropdown(!modelDropdown)} role="button" tabIndex={0}>
            <span className="model-name">{modelLabels[config?.model] || 'Gemini'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {modelDropdown && (
              <div className="model-dropdown">
                {Object.entries(modelLabels).map(([key, label]) => (
                  <div
                    key={key}
                    className={`model-option ${config?.model === key ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModelDropdown(false);
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="main-nav-right">
          <div className="user-avatar" aria-label="User profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content" ref={chatContainerRef}>
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Greeting */}
              <div className="greeting">
                <h1 className="greeting-title">
                  <span className="greeting-gradient">Hello, Dev</span>
                </h1>
                <p className="greeting-subtitle">How can I help you today?</p>
              </div>

              {/* Suggestion Cards */}
              <div className="suggestion-cards">
                {SUGGESTED_CARDS.map((card, index) => (
                  <motion.div
                    key={card.id}
                    className="suggestion-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(card.text)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(card.text);
                      }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  >
                    <p className="suggestion-text">{card.text}</p>
                    <div className="suggestion-icon">{card.icon}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-feed"
              className="chat-feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              aria-label="Chat content"
            >
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  id={msg.id}
                  role={msg.role}
                  content={msg.content}
                  image={msg.image}
                  attachments={msg.attachments}
                  loading={loading && msg.role === 'assistant' && msg.content === ''}
                />
              ))}
              <div ref={chatEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ARIA live region for screen readers */}
        <div
          aria-live="polite"
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
        >
          {lastAssistant}
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="main-bottom">
        <Composer />
        <p className="bottom-disclaimer">
          Gemini may display inaccurate info, including about people, so double-check its responses.
          Your privacy and Gemini Apps.
        </p>
      </div>
    </div>
  );
};

export default Main;
