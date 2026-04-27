import { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Settings from './components/Settings/Settings';
import Modal from './components/Modal/Modal';
import Tour from './components/Tour/Tour';
import Dashboard from './components/Dashboard/Dashboard';
import { Context } from './context/context';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

import './App.css';

const App = () => {
  const [sidebarExtended, setSidebarExtended] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const { 
    showSettings, setShowSettings,
    showHelp, setShowHelp, 
    showActivity, setShowActivity, 
    showAccount, setShowAccount,
    showDashboard, setShowDashboard,
    config,
    user, loginWithGoogle, loginWithGithub, logout,
    prevPrompts,
    loadChat,
    newChat
  } = useContext(Context);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('gemini_tour_completed');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 2000);
    }
  }, []);

  // Handle Shared Chat Links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedChatId = params.get('chatId');
    if (sharedChatId) {
      loadChat(sharedChatId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loadChat]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('gemini_tour_completed', 'true');
  };


  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizing = useRef(false);

  useEffect(() => {
    // Apply theme
    document.body.className = config.theme ? `theme-${config.theme}` : 'theme-dark';
  }, [config.theme]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 180 && newWidth < 480) {
      setSidebarWidth(newWidth);
    }
  }, []);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onNewChat: () => {
      newChat();
    },
    onSearch: () => {
      if (!sidebarExtended && !isMobile) setSidebarExtended(true);
      setTimeout(() => {
        const searchInput = document.querySelector('.sidebar-search input');
        if (searchInput) searchInput.focus();
      }, 100);
    },
    onEsc: () => {
      setShowSettings(false);
      setShowHelp(false);
      setShowActivity(false);
      setShowAccount(false);
    }
  });


  // Track mobile state
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarExtended((prev) => !prev);
    }
  }, [isMobile]);

  return (
    <div className="app">
      <AnimatePresence>
        {showSettings && <Settings />}
      </AnimatePresence>

      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Help & Support">
        <div className="help-content">
          <p>Welcome to Gemini Pro. Here are some tips:</p>
          <ul>
            <li><strong>Cmd + K</strong>: Search history</li>
            <li><strong>Cmd + Shift + N</strong>: New chat</li>
            <li><strong>Esc</strong>: Close settings/modals</li>
          </ul>
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
              <button className="github-btn" onClick={() => { loginWithGithub(); setShowAccount(false); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Sign in with GitHub
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Dashboard Modal */}
      <Modal isOpen={showDashboard} onClose={() => setShowDashboard(false)} title="Analytics">
         <Dashboard onClose={() => setShowDashboard(false)} />
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
        <div 
          className={isMobile ? 'mobile-sidebar-wrapper' : 'sidebar-container'}
          style={!isMobile && sidebarExtended ? { width: `${sidebarWidth}px` } : {}}
        >
          <Sidebar extended={isMobile ? true : sidebarExtended} onToggleSidebar={toggleSidebar} />
          {!isMobile && sidebarExtended && (
            <div className="sidebar-resizer" onMouseDown={startResizing} />
          )}
        </div>
      )}

      {/* Main content */}
      <Main onToggleSidebar={toggleSidebar} />
      
      {showTour && <Tour onComplete={handleTourComplete} />}
    </div>
  );
};

export default App;
