/* eslint-disable react/prop-types */
import { createContext, useCallback, useState, useEffect } from 'react';
import { streamChat } from '../api/client';
import { checkContent } from '../utils/moderation';
import { PERSONAS } from '../utils/personas';
import { logEvent } from '../utils/analytics';
import { onAuthChange, loginWithGoogle, logout } from '../config/firebase';


export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // [{ id, role, content, createdAt }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // optional error message

  const [prevPrompts, setPrevPrompts] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const [showHelp, setShowHelp] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [ragDocId, setRagDocId] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [attachments, setAttachments] = useState([]); // [{ id, data, name }]

  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [config, setConfig] = useState({
    model: "gemini-2.5-flash",
    temperature: 1.0,
    persona: "helpful_assistant",
    comparisonMode: false,
    comparisonModel: "gemini-2.5-pro",
    plugins: {
      googleSearch: false
    }
  });


  // Load config from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('gemini_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch { /* ignore */ }
  }, []);

  const updateConfig = useCallback(async (newConfig) => {
    let updated;
    setConfig((prev) => {
      updated = { ...prev, ...newConfig };
      localStorage.setItem('gemini_config', JSON.stringify(updated));
      return updated;
    });

    // If logged in, sync to server in background
    if (user && updated) {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const token = await user.getIdToken();
        fetch(`${apiBase}/api/user/settings`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ settings: updated })
        });
      } catch (err) {
        console.warn('Sync settings failed', err);
      }
    }
  }, [user]);

  // Sync auth state and load settings
  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          const token = await u.getIdToken();
          const res = await fetch(`${apiBase}/api/user/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const remoteSettings = await res.json();
            setConfig((prev) => ({ ...prev, ...remoteSettings }));
          }
        } catch (err) {
          console.warn('Load settings failed', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const saveHistory = useCallback((history) => {
    localStorage.setItem('gemini_history', JSON.stringify(history));
  }, []);

  const persistChat = useCallback((chatId, title, msgs) => {
    localStorage.setItem(`gemini_chat_${chatId}`, JSON.stringify(msgs));
  }, []);

  const loadChat = useCallback((chatId) => {
    try {
      const data = localStorage.getItem(`gemini_chat_${chatId}`);
      if (data) {
        setMessages(JSON.parse(data));
        setCurrentChatId(chatId);
      }
    } catch { /* ignore */ }
  }, []);

  const newChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setInput('');
    setAttachments([]);
  }, []);

  const renameConversation = useCallback((chatId, newTitle) => {
    setPrevPrompts((prev) => {
      const updated = prev.map((p) => (p.id === chatId ? { ...p, title: newTitle } : p));
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  const deleteConversation = useCallback((chatId) => {
    setPrevPrompts((prev) => {
      const updated = prev.filter((p) => p.id !== chatId);
      saveHistory(updated);
      return updated;
    });
    localStorage.removeItem(`gemini_chat_${chatId}`);
    if (currentChatId === chatId) newChat();
  }, [currentChatId, newChat, saveHistory]);

  const pinConversation = useCallback((chatId) => {
    setPrevPrompts((prev) => {
      const updated = prev.map((p) => (p.id === chatId ? { ...p, pinned: !p.pinned } : p));
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  const addTemplate = (title, prompt) => {
    const newT = { id: Date.now().toString(), title, prompt };
    setTemplates((prev) => {
      const updated = [...prev, newT];
      localStorage.setItem('gemini_templates', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('gemini_templates', JSON.stringify(updated));
      return updated;
    });
  };

  const onSent = useCallback(
    async (customPrompt) => {
      const finalPrompt = customPrompt || input;
      if (!finalPrompt.trim() && attachments.length === 0) return;

      // 1. Content Moderation (Client-side)
      try {
        const mod = checkContent(finalPrompt);
        if (mod.flagged) {
          setError(`Flagged: ${mod.categories.join(', ')}`);
          return;
        }
      } catch (e) {
        console.warn('Moderation check failed', e);
      }

      // Determine Chat ID
      let chatId = currentChatId;
      let isNewChat = false;
      if (!chatId) {
        chatId = Date.now().toString();
        setCurrentChatId(chatId);
        isNewChat = true;

        // Add to history list if it's a new chat
        setPrevPrompts((prev) => {
          const updated = [{ id: chatId, title: finalPrompt.slice(0, 40) || 'New Chat' }, ...prev];
          saveHistory(updated);
          return updated;
        });
      }

      // If it's a new chat, generate a better title in the background
      if (isNewChat && finalPrompt) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        fetch(`${apiBase}/api/generate-title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: finalPrompt })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.title) {
              renameConversation(chatId, data.title);
            }
          })
          .catch((err) => console.warn('Auto-titling failed', err));
      }

      // Add user message instantly
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: finalPrompt,
        attachments: [...attachments],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, userMsg];
        persistChat(chatId, finalPrompt || 'Image Prompt', updated);
        return updated;
      });


  setInput('');
  setAttachments([]);
      setLoading(true);
      setError(null);

      // Create placeholder for assistant message
      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        contentB: config.comparisonMode ? '' : null,
        modelA: config.model,
        modelB: config.comparisonMode ? config.comparisonModel : null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const runSingleStream = async (targetField, targetModel) => {
        try {
          const streamConfig = {
            ...config,
            model: targetModel,
            systemInstruction: PERSONAS[config.persona]?.instruction || null
          };
          
          const response = await streamChat({ 
            prompt: finalPrompt, 
            image: userMsg.attachments, 
            config: streamConfig,
            docId: ragDocId
          });

          if (!response.ok) throw new Error(`Server error: ${response.status}`);
          if (!response.body) throw new Error('ReadableStream not supported.');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = '';
          let done = false;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              accumulatedText += decoder.decode(value, { stream: true });
              setMessages((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((m) => m.id === assistantMsgId);
                if (idx !== -1) {
                  updated[idx] = { ...updated[idx], [targetField]: accumulatedText };
                }
                return updated;
              });
            }
          }
        } catch (err) {
          console.error(`Stream error for ${targetModel}:`, err);
          setMessages((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((m) => m.id === assistantMsgId);
            if (idx !== -1) {
              updated[idx] = { 
                ...updated[idx], 
                [targetField]: (updated[idx][targetField] || '') + '\n\n⚠️ Error generating response.' 
              };
            }
            return updated;
          });
        }
      };

      setSmartSuggestions([]); // Clear previous suggestions
      try {
        logEvent('send_attempt', { length: finalPrompt.length, model: config?.model });
        
        if (config.comparisonMode) {
          await Promise.all([
            runSingleStream('content', config.model),
            runSingleStream('contentB', config.comparisonModel)
          ]);
        } else {
          await runSingleStream('content', config.model);
        }

        // Final persistence
        let finalMessages;
        setMessages((prev) => {
          finalMessages = prev;
          persistChat(chatId, finalPrompt || 'New Chat', prev);
          return prev;
        });

        // Generate context-aware follow-up suggestions
        if (finalMessages && finalMessages.length > 0) {
          const apiBase = (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')) || 'http://localhost:5000';
          fetch(`${apiBase}/api/generate-suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: finalMessages.slice(-5) })
          }).then(res => res.json())
            .then(data => setSmartSuggestions(data))
            .catch(err => console.warn('Failed to fetch suggestions', err));
        }

      } catch (err) {
        console.error('Chat API error:', err);
        const errorMessage = err?.message || 'Something went wrong while contacting Gemini.';
        setError(errorMessage);
        logEvent('send_error', { message: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, currentChatId, saveHistory, attachments, config, persistChat, renameConversation]
  );

    // Retry helper: resend the last user prompt that preceded a given assistant message
    const retryMessage = useCallback((assistantMsgId) => {
      // Find the index of the assistant message
      setMessages((prevMessages) => {
        const idx = prevMessages.findIndex((m) => m.id === assistantMsgId);
        if (idx === -1) return prevMessages;

        // Find the previous user message before that index
        for (let i = idx - 1; i >= 0; i -= 1) {
          if (prevMessages[i].role === 'user' && prevMessages[i].content) {
            // Kick off a resend using onSent with customPrompt
            // Note: onSent will append a new user message and assistant placeholder
            void onSent(prevMessages[i].content);
            break;
          }
        }
        return prevMessages;
      });
    }, [onSent]);

  const contextValue = {
  input,
  setInput,
  attachments,
  setAttachments,
    messages,
    loading,
    error,
    onSent,
    newChat,
    prevPrompts,
    renameConversation,
    deleteConversation,
    pinConversation,
    setPrevPrompts,
    loadChat,
    currentChatId,
    templates,
    addTemplate,
    deleteTemplate,
    retryMessage,
    updateConfig,
    showSettings,
    setShowSettings,
    showHelp,
    setShowHelp,
    showActivity,
    setShowActivity,
    showAccount,
    setShowAccount,
    showDashboard,
    setShowDashboard,
    ragDocId,
    setRagDocId,
    smartSuggestions,
    setSmartSuggestions,
    user,
    loginWithGoogle,
    logout,
    config,
    isSyncing
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
