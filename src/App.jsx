import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import "./App.css";

const App = () => {
  // Controls sidebar visibility on mobile (under 600px)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar toggle handler
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={sidebarOpen ? "sidebar-open" : ""}>
        <Sidebar onToggleSidebar={toggleSidebar} />
      </div>

      {/* Main content */}
      <Main onToggleSidebar={toggleSidebar} />
    </div>
  );
};

export default App;
