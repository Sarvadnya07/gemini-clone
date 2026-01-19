import { useContext, useMemo } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';
import Message from '../Message/Message';
import Composer from '../Composer/Composer';

const SUGGESTED_CARDS = [
  {
    id: 1,
    text: 'Suggest beautiful places to see on an upcoming road trip',
    icon: assets.compass_icon,
    alt: 'Compass icon',
  },
  {
    id: 2,
    text: 'Briefly summarize this concept: urban planning',
    icon: assets.bulb_icon,
    alt: 'Bulb icon',
  },
  {
    id: 3,
    text: 'Brainstorm team bonding activities for our work retreat',
    icon: assets.message_icon,
    alt: 'Message icon',
  },
  {
    id: 4,
    text: 'Improve the readability of the following code',
    icon: assets.code_icon,
    alt: 'Code icon',
  },
];

const Main = () => {
  const { setInput, onSent, messages, loading } = useContext(Context);

  const handleCardClick = (text) => {
    setInput(text);
    onSent(text);
  };

  const handleKeyDownIcon = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Compute last assistant message for screen-reader announcements
  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') return messages[i].content || '';
    }
    return '';
  }, [messages]);

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="User avatar" />
      </div>

      <div className="main-container">
        {messages.length === 0 ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Dev</span>
              </p>
              <p>How can I help you today?</p>
            </div>
            <div className="cards" aria-label="Chat content">
              {SUGGESTED_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(card.text)}
                  onKeyDown={(e) => handleKeyDownIcon(e, () => handleCardClick(card.text))}
                >
                  <p>{card.text}</p>
                  <img src={card.icon} alt={card.alt} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="cards" aria-label="Chat content">
            {messages.map((msg) => (
              <Message
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                image={msg.image}
                attachments={msg.attachments}
                loading={loading && msg.role === 'assistant' && msg.content === ''}
              />
            ))}
          </div>
        )}

        {/* ARIA live region for screen readers (kept visually hidden) */}
        <div aria-live="polite" style={{position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden'}}>
          {lastAssistant}
        </div>

        <div className="main-bottom">
          <Composer />

          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so double check its responses. Your privacy and Gemini Apps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
