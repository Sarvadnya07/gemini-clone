import { useState, useCallback, useContext, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Settings from './components/Settings/Settings';
import Modal from './components/Modal/Modal';
import { Context } from './context/context';

import './App.css';

const App = () => {
  const [sidebarExtended, setSidebarExtended] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { 
    showSettings, 
    showHelp, setShowHelp, 
    showActivity, setShowActivity, 
    showAccount, setShowAccount,
    user, loginWithGoogle, logout,
    prevPrompts
  } = useContext(Context);


  // Track mobile state
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarExtended((prev) => !prev);
    }
  }, [isMobile]);

  return (
    <div className="app">
      <AnimatePresence>{showSettings && <Settings />}</AnimatePresence>
      
      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Help & Support">
        <div className="help-content">
          <p>Welcome to Gemini Clone! Here you can interact with Google's advanced AI models.</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><b>Voice Input:</b> Click the microphone to speak your prompt.</li>
            <li><b>Attachments:</b> Upload images or files for multi-modal analysis.</li>
            <li><b>Streaming:</b> Enjoy real-time response generation.</li>
          </ul>
        </div>
      </Modal>

      {/* Activity Modal */}
      <Modal isOpen={showActivity} onClose={() => setShowActivity(false)} title="Recent Activity">
        <div className="activity-list">
          {prevPrompts.length > 0 ? (
            prevPrompts.slice(0, 10).map((p) => (
              <div key={p.id} className="activity-item" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {p.title}
              </div>
            ))
          ) : (
            <p>No recent activity found.</p>
          )}
        </div>
      </Modal>

      {/* Account Modal / Auth */}
      <Modal isOpen={showAccount} onClose={() => setShowAccount(false)} title={user ? "Your Account" : "Sign In"}>
        <div className="auth-card">
          {user ? (
            <>
              <img src={user.photoURL} alt={user.displayName} style={{ borderRadius: '50%', width: '64px' }} />
              <h3>{user.displayName}</h3>
              <p>{user.email}</p>
              <button className="logout-btn" onClick={() => { logout(); setShowAccount(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <p>Sign in to sync your chats across all your devices.</p>
              <button className="google-btn" onClick={() => { loginWithGoogle(); setShowAccount(false); }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="" />
                Sign in with Google
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Mobile overlay */}

      {isMobile && mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar - hidden on mobile unless opened */}
      {(!isMobile || mobileOpen) && (
        <div className={isMobile ? 'mobile-sidebar-wrapper' : ''}>
          <Sidebar extended={isMobile ? true : sidebarExtended} onToggleSidebar={toggleSidebar} />
        </div>
      )}

      {/* Main content */}
      <Main onToggleSidebar={toggleSidebar} />
    </div>
  );
};

export default App;
