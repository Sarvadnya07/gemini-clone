import React, { useCallback, useContext } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';

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
  const { input, setInput, onSent, messages, loading } = useContext(Context);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || loading) return;
      // onSent uses input from context when no argument is passed
      onSent();
    },
    [input, loading, onSent]
  );

  const handleCardClick = (text) => {
    // Fill input AND send immediately
    setInput(text);
    onSent(text);
  };

  const handleKeyDownIcon = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const handleMicClick = () => {
    // 🎤 Hook browser speech recognition later
    console.log('Mic clicked');
  };

  const handleGalleryClick = () => {
    // 🖼️ Hook image upload / file picker later
    console.log('Gallery clicked');
  };

  return (
    <div className="main">
      {/* Top Nav */}
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} alt="User avatar" />
      </div>

      <div className="main-container">
        {/* Greeting Section */}
        <div className="greet">
          <p>
            <span>Hello, Dev</span>
          </p>
          <p>How can I help you today?</p>
        </div>

        {/* Cards Area: Suggestions when empty, chat when you have messages */}
        <div className="cards" aria-label="Chat content">
          {messages.length === 0 ? (
            SUGGESTED_CARDS.map((card) => (
              <div
                key={card.id}
                className="card"
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(card.text)}
                onKeyDown={(e) =>
                  handleKeyDownIcon(e, () => handleCardClick(card.text))
                }
              >
                <p>{card.text}</p>
                <img src={card.icon} alt={card.alt} />
              </div>
            ))
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className="card"
                style={{
                  backgroundColor:
                    msg.role === 'user' ? '#e6f0ff' : '#f0f4f9',
                }}
              >
                <p>
                  <strong>
                    {msg.role === 'user' ? 'You: ' : 'Gemini: '}
                  </strong>
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Bottom Input / Search Box */}
        <div className="main-bottom">
          <form className="search-box" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter a prompt here"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Enter a prompt"
            />

            {/* matches your CSS .search-boxdiv */}
            <div className="search-boxdiv">
              {/* Gallery */}
              <img
                src={assets.gallery_icon}
                alt="Open gallery"
                role="button"
                tabIndex={0}
                onClick={handleGalleryClick}
                onKeyDown={(e) => handleKeyDownIcon(e, handleGalleryClick)}
              />

              {/* Mic */}
              <img
                src={assets.mic_icon}
                alt="Use microphone"
                role="button"
                tabIndex={0}
                onClick={handleMicClick}
                onKeyDown={(e) => handleKeyDownIcon(e, handleMicClick)}
              />

              {/* Send */}
              <img
                src={assets.send_icon}
                alt={loading ? 'Sending…' : 'Send prompt'}
                role="button"
                tabIndex={0}
                onClick={handleSubmit}
                onKeyDown={(e) => handleKeyDownIcon(e, handleSubmit)}
                style={{
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  pointerEvents:
                    loading || !input.trim() ? 'none' : 'auto',
                }}
              />
            </div>
          </form>

          <p className="bottom-info">
            {loading
              ? 'Gemini is thinking...'
              : 'Gemini may display inaccurate info, including about people, so double check its responses. Your privacy and Gemini Apps.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
