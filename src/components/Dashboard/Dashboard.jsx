import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Context } from '../../context/context';
import './Dashboard.css';

const Dashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(Context);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const token = await user.getIdToken();
        const res = await fetch(`${apiBase}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Fetch stats failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <div className="dashboard-loading">Loading stats...</div>;

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Chats</span>
          <span className="stat-value">{stats?.totalChats || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Messages</span>
          <span className="stat-value">{stats?.totalMessages || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Most Used Model</span>
          <span className="stat-value">
            {Object.keys(stats?.modelUsage || {}).sort((a,b) => stats.modelUsage[b] - stats.modelUsage[a])[0] || 'N/A'}
          </span>
        </div>
      </div>

      <div className="model-usage-section">
        <h3>Model Usage Breakdown</h3>
        <div className="usage-bars">
          {Object.entries(stats?.modelUsage || {}).map(([model, count]) => (
            <div key={model} className="usage-item">
              <div className="usage-info">
                <span>{model}</span>
                <span>{count} msgs</span>
              </div>
              <div className="usage-bar-bg">
                <div 
                  className="usage-bar-fill" 
                  style={{ width: `${(count / stats.totalMessages) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
