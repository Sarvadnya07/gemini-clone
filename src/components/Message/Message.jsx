/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { assets } from '../../assets/assets';
import './Message.css';
import { Context } from '../../context/context';
import { speak, stop, pause, resume } from '../../utils/tts';
import Lightbox from '../Lightbox/Lightbox';

const Message = ({ id, role, content, image, attachments, loading }) => {
    const ctx = useContext(Context) || {};
    const { retryMessage } = ctx;

    const handleCopy = async () => {
        if (!content) return;
        try {
            await navigator.clipboard.writeText(content);
        } catch (e) {
            console.error('Copy failed', e);
        }
    };

    const [lightboxSrc, setLightboxSrc] = useState(null);

    const handleSpeak = () => {
        if (!content) return;
        speak(content, { rate: 1.0 });
    };

    const handleStopSpeak = () => stop();
    const handlePauseSpeak = () => pause();
    const handleResumeSpeak = () => resume();

    const openLightbox = (items, index = 0) => setLightboxSrc({ items, index });
    const closeLightbox = () => setLightboxSrc(null);

    const handleRetry = () => {
        if (!id) return;
        retryMessage(id);
    };

    return (
        <div className={`message ${role}`}>
            <div className="message-avatar">
                {role === 'user' ? (
                    <img src={assets.user_icon} alt="User" />
                ) : (
                    <img src={assets.gemini_icon} alt="Gemini" className={loading ? 'rotating' : ''} />
                )}
            </div>
            <div className="message-content">
                {attachments && attachments.length > 0 && (
                    <div className="message-attachments">
                        {attachments.map((att, idx) => (
                            <img key={att.id} src={att.data || att} alt={att.name || 'Uploaded'} className="message-image" onClick={() => openLightbox(attachments, idx)} />
                        ))}
                    </div>
                )}
                {image && <img src={image} alt="Uploaded" className="message-image" />}

                {loading && (!content || content.trim() === '') ? (
                  <div className="message-skeleton">
                    <div className="s-line" />
                    <div className="s-line short" />
                  </div>
                ) : role === 'user' ? (
                    <p>{content}</p>
                ) : (
                    <div className="markdown-body">
                        <ReactMarkdown
                            components={{
                                code({ inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            {...props}
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code {...props} className={className}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}

                <div className="message-actions">
                    <button onClick={handleCopy} aria-label="Copy message">Copy</button>
                    {role === 'assistant' ? (
                        <>
                          <button onClick={handleSpeak} aria-label="Speak message">Speak</button>
                          <button onClick={handlePauseSpeak} aria-label="Pause speaking">Pause</button>
                          <button onClick={handleResumeSpeak} aria-label="Resume speaking">Resume</button>
                          <button onClick={handleStopSpeak} aria-label="Stop speaking">Stop</button>
                          <button onClick={handleRetry} aria-label="Retry generation">Retry</button>
                        </>
                    ) : null}
                </div>
            </div>
                        {lightboxSrc && (
                            <Lightbox items={lightboxSrc.items} initialIndex={lightboxSrc.index} alt="Attachment preview" onClose={closeLightbox} downloadName="attachment" />
                        )}
        </div>
    );
};

export default Message;
