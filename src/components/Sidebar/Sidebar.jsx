import { useState, useCallback, useContext } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const [filter, setFilter] = useState('');
  const { prevPrompts, newChat, loadChat, setShowSettings, renameConversation, deleteConversation, pinConversation } = useContext(Context);

  const toggleExtended = useCallback(() => {
    setExtended((prev) => !prev);
  }, []);

  const handleNewChat = () => {
    newChat();
  }

  const handleLoadChat = (chatId) => {
    loadChat(chatId);
  }

  const handleSettingsClick = () => {
    setShowSettings(true);
  }

  return (
    <div className="sidebar">
      <div className="top">
        <div onClick={toggleExtended} className="menu">
          <img src={assets.menu_icon} alt="" />
        </div>
        <div onClick={handleNewChat} className="new-chat">
          <img src={assets.plus_icon} alt="" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>

            <div className="recent-search">
              <input type="text" placeholder="Search conversations" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search conversations" />
            </div>

            {prevPrompts.filter(p => (p.title || '').toLowerCase().includes(filter.toLowerCase())).map((item, index) => {
              return (
                <div key={item.id || index} className={`recent-entry ${item.pinned ? 'pinned' : ''}`}>
                  <div className="recent-entry-main" onClick={() => handleLoadChat(item.id)}>
                    <img src={assets.message_icon} alt="" />
                    <p>{(item.title || '').slice(0, 18)}{(item.title || '').length > 18 ? ' ...' : ''}</p>
                  </div>

                  {extended ? (
                    <div className="recent-entry-actions">
                      <button onClick={() => {
                        const newTitle = window.prompt('Rename conversation', item.title || '');
                        if (newTitle !== null && newTitle.trim() !== '') renameConversation(item.id, newTitle.trim());
                      }} aria-label="Rename">✏️</button>

                      <button onClick={() => {
                        const ok = window.confirm('Delete this conversation?');
                        if (ok) deleteConversation(item.id);
                      }} aria-label="Delete">🗑️</button>

                      <button onClick={() => pinConversation(item.id)} aria-label="Pin">📌</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div onClick={handleSettingsClick} className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
