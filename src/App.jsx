import { useState, useCallback, useContext, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Settings from './components/Settings/Settings';
import { Context } from './context/context';
import './App.css';

const App = () => {
  const [sidebarExtended, setSidebarExtended] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { showSettings } = useContext(Context);

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
