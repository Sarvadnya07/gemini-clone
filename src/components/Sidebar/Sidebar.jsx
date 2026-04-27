import { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import './Sidebar.css';
import { Context } from '../../context/context';

const Sidebar = ({ extended, onToggleSidebar }) => {

  const [filter, setFilter] = useState('');
  const {
    prevPrompts,
    newChat,
    loadChat,
    setShowSettings,
    setShowHelp,
    setShowActivity,
    setShowDashboard,
    renameConversation,
    deleteConversation,
    pinConversation,
    currentChatId,
    documents,
    ragDocId,
    setRagDocId,
    deleteDocument,
    isSyncing
  } = useContext(Context);


  const recentRef = useRef(null);

  const handleNewChat = () => {
    newChat();
  };

  const handleLoadChat = (chatId) => {
    loadChat(chatId);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const filteredPrompts = prevPrompts.filter((p) =>
    (p.title || '').toLowerCase().includes(filter.toLowerCase())
  );

  const pinnedPrompts = filteredPrompts.filter(p => p.pinned);
  const recentPrompts = filteredPrompts.filter(p => !p.pinned);

  return (
    <motion.div
      className="sidebar"
      animate={{ width: extended ? 260 : 68 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-top">
        {/* Hamburger / Menu toggle */}
        <button
          className="sidebar-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* New Chat Button */}
        <button className="sidebar-new-chat" onClick={handleNewChat}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <AnimatePresence>
            {extended && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="sidebar-label"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Recent Section */}
        <AnimatePresence>
          {extended && (
            <motion.div
              className="sidebar-recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="sidebar-recent-title">Recent</p>
              <div className="sidebar-search">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Search conversations"
                />
              </div>

              <div className="sidebar-recent-list" ref={recentRef}>
                {pinnedPrompts.length > 0 && (
                  <div className="sidebar-section">
                    <p className="sidebar-section-title">Pinned</p>
                    {pinnedPrompts.map((item, index) => (
                      <div
                        key={item.id || index}
                        className={`sidebar-entry active-pinned ${currentChatId === item.id ? 'active' : ''}`}
                        onClick={() => handleLoadChat(item.id)}
                      >
                        <svg className="sidebar-entry-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                          <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5.76z"/>
                        </svg>
                        <span className="sidebar-entry-text">
                          {(item.title || '').slice(0, 28)}
                        </span>
                        <div className="sidebar-entry-actions" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => pinConversation(item.id)} title="Unpin">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5.76z"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="sidebar-section">
                  {pinnedPrompts.length > 0 && <p className="sidebar-section-title">Recent</p>}
                  {recentPrompts.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`sidebar-entry ${currentChatId === item.id ? 'active' : ''}`}
                      onClick={() => handleLoadChat(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleLoadChat(item.id);
                      }}
                    >
                      <svg className="sidebar-entry-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="sidebar-entry-text">
                        {(item.title || '').slice(0, 28)}
                        {(item.title || '').length > 28 ? '...' : ''}
                      </span>

                      <div className="sidebar-entry-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            const newTitle = window.prompt('Rename conversation', item.title || '');
                            if (newTitle !== null && newTitle.trim() !== '')
                              renameConversation(item.id, newTitle.trim());
                          }}
                          aria-label="Rename"
                          title="Rename"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this conversation?'))
                              deleteConversation(item.id);
                          }}
                          aria-label="Delete"
                          title="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                        <button
                          onClick={() => pinConversation(item.id)}
                          aria-label={item.pinned ? 'Unpin' : 'Pin'}
                          title={item.pinned ? 'Unpin' : 'Pin'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={item.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5.76z"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Fade mask at bottom */}
                <div className="sidebar-recent-fade" />
              </div>

              {/* Knowledge Base Section */}
              <div className="sidebar-kb">
                <div className="sidebar-kb-header">
                  <p className="sidebar-recent-title">Knowledge Base</p>
                  <div className="kb-badge">{documents.length}</div>
                </div>
                <div className="sidebar-kb-list">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className={`sidebar-entry kb-entry ${ragDocId === doc._id ? 'active' : ''}`}
                      onClick={() => setRagDocId(ragDocId === doc._id ? null : doc._id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="sidebar-entry-text">{doc.filename}</span>
                      
                      <div className="sidebar-entry-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${doc.filename}?`)) deleteDocument(doc._id);
                          }}
                          aria-label="Delete document"
                          title="Delete document"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="kb-empty">No documents uploaded</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom items */}
      <div className="sidebar-bottom">
        <button className="sidebar-bottom-item" onClick={() => setShowHelp(true)} aria-label="Help">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <AnimatePresence>
            {extended && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-label">
                Help
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button className="sidebar-bottom-item" onClick={() => setShowActivity(true)} aria-label="Activity">
          <div className={`sync-indicator ${isSyncing ? 'syncing' : ''}`} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <AnimatePresence>
            {extended && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-label">
                Activity
              </motion.span>
            )}
          </AnimatePresence>
        </button>


        <button className="sidebar-bottom-item" onClick={() => setShowDashboard(true)} aria-label="Analytics">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <AnimatePresence>
            {extended && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-label">
                Analytics
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button className="sidebar-bottom-item" onClick={handleSettingsClick} aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <AnimatePresence>
            {extended && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sidebar-label">
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

Sidebar.propTypes = {
  extended: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;

