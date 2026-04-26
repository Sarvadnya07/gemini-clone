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

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('gemini_tour_completed');
    if (!hasSeenTour) {
      setTimeout(() => setShowTour(true), 2000);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('gemini_tour_completed', 'true');
  };
  const { 
    showSettings, setShowSettings,
    showHelp, setShowHelp, 
    showActivity, setShowActivity, 
    showAccount, setShowAccount,
    showDashboard, setShowDashboard,
    config,
    user, loginWithGoogle, logout,
    prevPrompts,
    newChat
  } = useContext(Context);

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
