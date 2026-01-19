import { useState, useCallback, useContext } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import Settings from "./components/Settings/Settings";
import { Context } from "./context/context";
import "./App.css";

const App = () => {
  // Controls sidebar visibility on mobile (under 600px)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showSettings } = useContext(Context);

  // Sidebar toggle handler
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="app">
      {showSettings && <Settings />}
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
