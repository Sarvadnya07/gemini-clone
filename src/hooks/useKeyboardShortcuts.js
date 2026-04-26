import { useEffect } from 'react';

const useKeyboardShortcuts = (actions) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + K: Focus search or Search history
      if (cmdOrCtrl && event.key === 'k') {
        event.preventDefault();
        actions.onSearch?.();
      }

      // Cmd/Ctrl + Shift + N: New Chat
      if (cmdOrCtrl && event.shiftKey && event.key === 'n') {
        event.preventDefault();
        actions.onNewChat?.();
      }

      // Esc: Close modals or stop generation
      if (event.key === 'Escape') {
        actions.onEsc?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};

export default useKeyboardShortcuts;
