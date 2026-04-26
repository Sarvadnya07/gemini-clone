import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import PropTypes from 'prop-types';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.contentLoaded();
      // Use a unique ID for each chart
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      }).catch(err => {
        console.error('Mermaid render error:', err);
        if (ref.current) {
          ref.current.innerHTML = '<div class="mermaid-error">Failed to render diagram</div>';
        }
      });
    }
  }, [chart]);

  return <div key={chart} ref={ref} className="mermaid" />;
};

Mermaid.propTypes = {
  chart: PropTypes.string.isRequired,
};

export default Mermaid;
