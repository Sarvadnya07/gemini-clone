import React, { useState, useCallback } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';

// Default recent chats (used if parent doesn't pass anything)
const DEFAULT_RECENTS = [
  { id: 1, title: 'What is React and how does it work?' },
  { id: 2, title: 'Explain closures in JavaScript' },
  { id: 3, title: 'Best roadmap for a full-stack developer' },
];

const Sidebar = ({
  recentConversations = DEFAULT_RECENTS,
  onNewChat,
  onSelectConversation,
  onOpenHelp,
  onOpenActivity,
  onOpenSettings,
}) => {
  const [extended, setExtended] = useState(false);

  const toggleExtended = useCallback(() => {
    setExtended((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    if (typeof onNewChat === 'function') {
      onNewChat();
    }
    // Later: you can also reset chat state in parent
  }, [onNewChat]);

  const handleConversationClick = (conversation) => {
    if (typeof onSelectConversation === 'function') {
      onSelectConversation(conversation);
    }
    // Optional: auto-collapse after selecting on mobile
    // setExtended(false);
  };

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handleHelpClick = () => {
    if (typeof onOpenHelp === 'function') onOpenHelp();
  };

  const handleActivityClick = () => {
    if (typeof onOpenActivity === 'function') onOpenActivity();
  };

  const handleSettingsClick = () => {
    if (typeof onOpenSettings === 'function') onOpenSettings();
  };

  return (
    <div className="sidebar">
      {/* Top Section */}
      <div className="top">
        {/* Menu icon wrapper to match .sidebar .menu styles */}
        <div
          className="menu"
          onClick={toggleExtended}
          role="button"
          tabIndex={0}
          aria-label="Toggle sidebar"
          aria-expanded={extended}
          onKeyDown={(e) => handleKeyDown(e, toggleExtended)}
        >
          <img src={assets.menu_icon} alt="" />
        </div>

        {/* New Chat */}
        <div
          className="new-chat"
          onClick={handleNewChat}
          role="button"
          tabIndex={0}
          aria-label="Start a new chat"
          onKeyDown={(e) => handleKeyDown(e, handleNewChat)}
        >
          <img src={assets.plus_icon} alt="Start new chat" />
          {extended ? <p>New chat</p> : null}
        </div>

        {/* Recent Chats */}
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>

            {recentConversations.length === 0 && (
              <div className="recent-entry">
                <img src={assets.message_icon} alt="" />
                <p>No recent chats yet</p>
              </div>
            )}

            {recentConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="recent-entry"
                onClick={() => handleConversationClick(conversation)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => handleConversationClick(conversation))
                }
              >
                <img src={assets.message_icon} alt="" />
                <p>
                  {conversation.title.length > 28
                    ? `${conversation.title.slice(0, 27)}…`
                    : conversation.title}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Bottom Section */}
      <div className="bottom">
        <div
          className="bottom-item recent-entry"
          onClick={handleHelpClick}
          role="button"
          tabIndex={0}
          aria-label="Open help"
          onKeyDown={(e) => handleKeyDown(e, handleHelpClick)}
        >
          <img src={assets.question_icon} alt="Help" />
          {extended ? <p>Help</p> : null}
        </div>

        <div
          className="bottom-item recent-entry"
          onClick={handleActivityClick}
          role="button"
          tabIndex={0}
          aria-label="Open activity"
          onKeyDown={(e) => handleKeyDown(e, handleActivityClick)}
        >
          <img src={assets.history_icon} alt="Activity" />
          {extended ? <p>Activity</p> : null}
        </div>

        <div
          className="bottom-item recent-entry"
          onClick={handleSettingsClick}
          role="button"
          tabIndex={0}
          aria-label="Open settings"
          onKeyDown={(e) => handleKeyDown(e, handleSettingsClick)}
        >
          <img src={assets.setting_icon} alt="Settings" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
