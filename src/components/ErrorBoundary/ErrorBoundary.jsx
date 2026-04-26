import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to error tracking service (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.toLowerCase().includes('network') || 
                             this.state.error?.message?.toLowerCase().includes('fetch');
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
          gap: '20px',
          color: '#e3e3e3',
          textAlign: 'center',
          background: 'var(--bg-color, #131314)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(234, 67, 53, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          
          <div style={{ maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 500 }}>
              {isNetworkError ? 'Connection Issue' : 'Application Error'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#9aa0a6', lineHeight: '1.5' }}>
              {this.state.error?.message || 'An unexpected error occurred. This might be a temporary glitch.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 24px',
                background: '#1a73e8',
                border: 'none',
                borderRadius: '100px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = '#1b66c9'}
              onMouseOut={(e) => e.target.style.background = '#1a73e8'}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '100px',
                color: '#e3e3e3',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Reload Page
            </button>
          </div>
          
          {window.location.hostname === 'localhost' && (
            <pre style={{
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#f28b82',
              textAlign: 'left',
              maxWidth: '90%',
              overflow: 'auto'
            }}>
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;

