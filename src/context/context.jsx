import { createContext, useCallback, useState } from 'react';

export const Context = createContext();

// Prefer reading API base URL from Vite env (with a safe fallback)
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')) ||
  'http://localhost:5000';

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // [{ id, role, content, createdAt }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // optional error message

  // Utility to append a message with metadata
  const appendMessage = useCallback((role, content) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setInput('');
  }, []);

  // Main send function
  const onSent = useCallback(
    async (customPrompt) => {
      const finalPrompt = (customPrompt ?? input).trim();
      if (!finalPrompt || loading) return;

      // Add user message instantly
      appendMessage('user', finalPrompt);
      setInput('');
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: finalPrompt }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const aiText =
          data?.response ||
          data?.text ||
          'No response from model. Please try again with a different prompt.';

        appendMessage('assistant', aiText);
      } catch (err) {
        console.error('Chat API error:', err);
        setError('Something went wrong while contacting Gemini.');
        appendMessage(
          'assistant',
          '⚠️ Something went wrong while contacting Gemini. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [appendMessage, input, loading]
  );

  const contextValue = {
    input,
    setInput,
    messages,
    loading,
    error,
    onSent,
    clearChat,
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
