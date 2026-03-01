import { useContext } from 'react';
import { motion } from 'framer-motion';
import './Settings.css';
import { Context } from '../../context/context';

const Settings = () => {
  const { config, updateConfig, setShowSettings, templates, addTemplate, deleteTemplate, setInput } =
    useContext(Context);

  const handleModelChange = (e) => {
    updateConfig({ model: e.target.value });
  };

  const handleTempChange = (e) => {
    updateConfig({ temperature: parseFloat(e.target.value) });
  };

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => setShowSettings(false)}
    >
      <motion.div
        className="settings-modal"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={() => setShowSettings(false)} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-group">
            <label>Model</label>
            <select value={config.model} onChange={handleModelChange}>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best Quality)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Balanced)</option>
            </select>
          </div>

          <div className="settings-group">
            <label>
              Temperature
              <span className="settings-value">{config.temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={handleTempChange}
            />
            <div className="range-labels">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="settings-group">
            <label>Prompt Templates</label>
            <div className="templates-list">
              {templates.map((t) => (
                <div key={t.id} className="template-entry">
                  <button className="template-use" onClick={() => setInput(t.prompt)}>
                    Use
                  </button>
                  <span className="template-title">{t.title}</span>
                  <button className="template-delete" onClick={() => deleteTemplate(t.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              className="template-create-btn"
              onClick={() => {
                const title = window.prompt('Template title');
                const prompt = window.prompt('Template prompt');
                if (title && prompt) addTemplate(title, prompt);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Save prompt as template
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
