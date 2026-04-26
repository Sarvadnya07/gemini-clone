import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Tour.css';

const STEPS = [
  {
    target: '.model-selector',
    title: 'Switch Models',
    content: 'Choose between Gemini Pro for quality or Flash for speed.'
  },
  {
    target: '.compare-btn',
    title: 'Compare Mode',
    content: 'Send one prompt to two models at once and compare results.'
  },
  {
    target: '.persona-badge',
    title: 'AI Personas',
    content: 'Give the AI a personality like "Python Expert" or "Creative Writer".'
  },
  {
    target: '.composer-input-area',
    title: 'Start Chatting',
    content: 'Type your message or upload files/images to begin.'
  }
];

const Tour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const el = document.querySelector(STEPS[currentStep].target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 12,
        left: Math.max(20, Math.min(window.innerWidth - 320, rect.left + window.scrollX))
      });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="tour-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="tour-popover"
          style={{ top: coords.top, left: coords.left }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
        >
          <div className="tour-header">
            <h3>{STEPS[currentStep].title}</h3>
            <span className="step-count">{currentStep + 1} / {STEPS.length}</span>
          </div>
          <p>{STEPS[currentStep].content}</p>
          <div className="tour-actions">
            <button className="tour-skip" onClick={onComplete}>Skip</button>
            <button className="tour-next" onClick={handleNext}>
              {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Tour;
