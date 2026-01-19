/* eslint-disable react/prop-types */
import React, { createContext, useCallback, useState, useEffect } from 'react';
import { streamChat } from '../api/client';
import { checkContent } from '../utils/moderation';
import { logEvent } from '../utils/analytics';

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // [{ id, role, content, createdAt }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // optional error message

  const [prevPrompts, setPrevPrompts] = useState([]); // List of { id, title }
  const [templates, setTemplates] = useState([]); // Saved prompt templates
  const [currentChatId, setCurrentChatId] = useState(null);
  const [attachments, setAttachments] = useState([]); // [{ id, data }]
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    model: "gemini-2.5-flash",
    temperature: 1.0
  });

  // Load config from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('gemini_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
  }, []);

  // Save config to localStorage
  const updateConfig = useCallback((newConfig) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('gemini_config', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPrompts = localStorage.getItem('gemini_prevPrompts');
      if (savedPrompts) {
        setPrevPrompts(JSON.parse(savedPrompts));
      }
      const savedTemplates = localStorage.getItem('gemini_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save to localStorage whenever prevPrompts changes
  const saveHistory = useCallback((prompts) => {
    localStorage.setItem('gemini_prevPrompts', JSON.stringify(prompts));
  }, []);

  const saveTemplates = useCallback((t) => {
    localStorage.setItem('gemini_templates', JSON.stringify(t));
  }, []);

  const addTemplate = useCallback((title, prompt) => {
    setTemplates((prev) => {
      const entry = { id: Date.now().toString(), title, prompt };
      const updated = [entry, ...prev];
      try { saveTemplates(updated); } catch (e) { console.error('save template failed', e); }
      return updated;
    });
  }, [saveTemplates]);

  const deleteTemplate = useCallback((id) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try { saveTemplates(updated); } catch (e) { console.error('delete template failed', e); }
      return updated;
    });
  }, [saveTemplates]);


  // Rename a conversation in the history
  const renameConversation = useCallback((chatId, newTitle) => {
    setPrevPrompts((prev) => {
      const updated = prev.map((p) => (p.id === chatId ? { ...p, title: newTitle } : p));
      try {
        saveHistory(updated);
      } catch (e) {
        console.error('Failed to save renamed conversation', e);
      }
      return updated;
    });
  }, [saveHistory]);

  // Delete a conversation and its persisted messages
  const deleteConversation = useCallback((chatId) => {
    setPrevPrompts((prev) => {
      const updated = prev.filter((p) => p.id !== chatId);
      try {
        saveHistory(updated);
        localStorage.removeItem(`gemini_chat_${chatId}`);
      } catch (e) {
        console.error('Failed to delete conversation', e);
      }
      return updated;
    });
    // If the deleted chat is currently open, clear it
    setMessages((msgs) => (msgs && msgs.length ? msgs : []));
    setCurrentChatId((id) => (id === chatId ? null : id));
  }, [saveHistory]);

  // Pin or unpin a conversation (bring to front when pinned)
  const pinConversation = useCallback((chatId) => {
    setPrevPrompts((prev) => {
      const idx = prev.findIndex((p) => p.id === chatId);
      if (idx === -1) return prev;
      const item = prev[idx];
      const without = prev.slice(0, idx).concat(prev.slice(idx + 1));
      const updated = [{ ...item, pinned: !item.pinned }, ...without];
      try {
        saveHistory(updated);
      } catch (e) {
        console.error('Failed to pin conversation', e);
      }
      return updated;
    });
  }, [saveHistory]);

  // (appendMessage helper removed — unused)

  const newChat = useCallback(() => {
    setLoading(false);
    setError(null);
    setMessages([]);
    setCurrentChatId(null);
    setAttachments([]);
  }, []);

  const loadChat = useCallback((chatId) => {
    try {
      const savedChat = localStorage.getItem(`gemini_chat_${chatId}`);
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
        setCurrentChatId(chatId);
      }
    } catch (e) {
      console.error('Failed to load chat', e);
    }
  }, []);

  // Main send function
  const onSent = useCallback(
    async (customPrompt) => {
      const finalPrompt = (customPrompt ?? input).trim();
      // Prevent sending while offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError('You are offline. Please check your network and try again.');
        return;
      }

      if ((!finalPrompt && (!attachments || attachments.length === 0)) || loading) return;

      // Client-side moderation preflight
      try {
        const mod = checkContent(finalPrompt);
        if (mod.flagged) {
          setError(mod.reason || 'Content blocked by moderation');
          // Log moderation event
          logEvent('moderation_block', { prompt: finalPrompt.slice(0, 120), reason: mod.reason });
          return;
        }
      } catch (e) {
        console.warn('Moderation check failed', e);
      }

      // Determine Chat ID
      let chatId = currentChatId;
      if (!chatId) {
        chatId = Date.now().toString();
        setCurrentChatId(chatId);

        // Add to history list if it's a new chat
        setPrevPrompts((prev) => {
          const updated = [{ id: chatId, title: finalPrompt || 'Image Prompt' }, ...prev];
          saveHistory(updated);
          return updated;
        });
      }

      // Add user message instantly
      const userMsgId = Date.now().toString();
      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: finalPrompt,
        attachments: attachments,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, userMsg];
        // Save full chat content
        localStorage.setItem(`gemini_chat_${chatId}`, JSON.stringify(updated));
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
        content: '', // Start empty
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        return updated;
      });

      try {
        // Analytics: log send attempt
        logEvent('send_attempt', { length: finalPrompt.length, model: config?.model });
        // Use the streaming endpoint via centralized client
  const response = await streamChat({ prompt: finalPrompt, image: userMsg.attachments, config });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulatedText = '';

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value, { stream: true });
          accumulatedText += chunkValue;

          // Update the assistant message content in real-time
          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: accumulatedText }
                : msg
            );
            // Save periodically or at least here
            localStorage.setItem(`gemini_chat_${chatId}`, JSON.stringify(updated));
            return updated;
          });
        }

      } catch (err) {
        console.error('Chat API error:', err);
        setError('Something went wrong while contacting Gemini.');
        logEvent('send_error', { message: err?.message });
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + '\n\n⚠️ Error: Failed to complete response.' }
              : msg
          );
          localStorage.setItem(`gemini_chat_${chatId}`, JSON.stringify(updated));
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, currentChatId, saveHistory, attachments, config]
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
    config,
    updateConfig,
    showSettings,
    setShowSettings
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
