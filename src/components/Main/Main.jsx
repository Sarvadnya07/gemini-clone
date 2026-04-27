import { useContext, useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import './Main.css';
import { Context } from '../../context/context';
import { PERSONAS } from '../../utils/personas';
import Message from '../Message/Message';
import Composer from '../Composer/Composer';
import { SUGGESTIONS } from '../../utils/suggestions';

const SUGGESTED_CARDS = SUGGESTIONS;

const Main = ({ onToggleSidebar }) => {
  const { setInput, onSent, messages, loading, config, setShowAccount, user, smartSuggestions, currentChatId } = useContext(Context);

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
          <div className="model-selector-group">
            <div className="model-selector" onClick={() => setModelDropdown(!modelDropdown)} role="button" tabIndex={0}>
              <div className="model-info">
                <span className="model-name">{modelLabels[config?.model] || 'Gemini'}</span>
                <span className="persona-badge">{PERSONAS[config?.persona]?.name || 'Assistant'}</span>
              </div>
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
                        updateConfig({ model: key });
                        setModelDropdown(false);
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {config.comparisonMode && (
              <>
                <div className="model-vs">VS</div>
                <div className="model-selector secondary" onClick={() => setModelDropdown('secondary')} role="button" tabIndex={0}>
                   <div className="model-info">
                    <span className="model-name">{modelLabels[config?.comparisonModel] || 'Gemini'}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {modelDropdown === 'secondary' && (
                    <div className="model-dropdown">
                      {Object.entries(modelLabels).map(([key, label]) => (
                        <div
                          key={key}
                          className={`model-option ${config?.comparisonModel === key ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateConfig({ comparisonModel: key });
                            setModelDropdown(false);
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button 
            className={`compare-btn ${config.comparisonMode ? 'active' : ''}`}
            onClick={() => updateConfig({ comparisonMode: !config.comparisonMode })}
            title="Comparison Mode"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="12" y1="3" x2="12" y2="17" />
              <line x1="10" y1="21" x2="14" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Compare</span>
          </button>

          {currentChatId && (
            <button 
              className="share-btn"
              onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}?chatId=${currentChatId}`;
                navigator.clipboard.writeText(url);
                alert('Collaboration link copied to clipboard!');
              }}
              title="Share Chat for Collaboration"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>Share</span>
            </button>
          )}
        </div>
        <div className="main-nav-right">
          <button className="user-avatar-btn" onClick={() => setShowAccount(true)} aria-label="User profile">
            {user ? (
              <img src={user.photoURL} alt={user.displayName} className="user-photo" />
            ) : (
              <div className="user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </button>
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
                    key={index}
                    className="suggestion-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(card.prompt)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(card.prompt);
                      }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  >
                    <p className="suggestion-title">{card.title}</p>
                    <p className="suggestion-desc">{card.desc}</p>
                    <div className="suggestion-icon-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
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
                  agents={msg.agents}
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
        <AnimatePresence>
          {smartSuggestions.length > 0 && !loading && (
            <motion.div 
              className="smart-suggestions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {smartSuggestions.map((s, i) => (
                <button key={i} className="smart-suggestion-btn" onClick={() => onSent(s)}>
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <Composer />
        <p className="bottom-disclaimer">
          Gemini may display inaccurate info, including about people, so double-check its responses.
          Your privacy and Gemini Apps.
        </p>
      </div>
    </div>
  );
};

Main.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Main;

