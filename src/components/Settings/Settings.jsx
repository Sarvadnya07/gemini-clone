import { useContext } from 'react';
import './Settings.css';
import { Context } from '../../context/context';

const Settings = () => {
    const { config, updateConfig, setShowSettings } = useContext(Context);
    const { templates, addTemplate, deleteTemplate, setInput } = useContext(Context);

    const handleModelChange = (e) => {
        updateConfig({ model: e.target.value });
    };

    const handleTempChange = (e) => {
        updateConfig({ temperature: parseFloat(e.target.value) });
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
                </div>

                <div className="settings-group">
                    <label>Model</label>
                    <select value={config.model} onChange={handleModelChange}>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best Quality)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Balanced)</option>
                    </select>
                </div>

                <div className="settings-group">
                    <label>Temperature ({config.temperature})</label>
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
                    <label>Prompt templates</label>
                    <div className="templates-list">
                        {templates.map((t) => (
                            <div key={t.id} className="template-entry">
                                <button onClick={() => setInput(t.prompt)} className="template-use">Use</button>
                                <p>{t.title}</p>
                                <button onClick={() => deleteTemplate(t.id)} className="template-delete">Delete</button>
                            </div>
                        ))}
                    </div>

                    <div className="template-create">
                        <button onClick={() => {
                            const title = window.prompt('Template title');
                            const prompt = window.prompt('Template prompt');
                            if (title && prompt) addTemplate(title, prompt);
                        }}>Save current prompt as template</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
