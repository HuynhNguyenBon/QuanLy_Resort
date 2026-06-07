import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../ChatSupport.css";

const renderBotText = (text) => ({
  __html: text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>"),
});

const fmtTime = (ts) =>
  new Date(ts || Date.now()).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

const ChatSupport = () => {
  const { t, i18n } = useTranslation("chat");
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [aiMsgs, setAiMsgs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Build KB from current language translations
  const buildKB = useCallback(() => {
    const responses = t("responses", { returnObjects: true });
    const patterns = t("patterns", { returnObjects: true });
    return Object.keys(responses).map((topic) => ({
      topic,
      patterns: patterns[topic] || [],
      response: responses[topic],
    }));
  }, [t, i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAIResponse = useCallback(
    (input, history) => {
      const lower = input.toLowerCase();
      const kb = buildKB();
      for (const item of kb) {
        if (item.patterns.some((p) => lower.includes(p)))
          return { text: item.response, topic: item.topic };
      }
      // Context follow-up
      const followUp = [
        "how much",
        "where",
        "what",
        "bao nhiêu",
        "ở đâu",
        "thế nào",
        "いくら",
        "どこ",
      ];
      const isFollowUp =
        followUp.some((k) => lower.includes(k)) || lower.length < 20;
      if (isFollowUp && history.length > 0) {
        const lastBot = [...history]
          .reverse()
          .find((m) => m.sender === "bot" && m.topic);
        if (lastBot?.topic) {
          const related = kb.find((item) => item.topic === lastBot.topic);
          if (related) return { text: related.response, topic: related.topic };
        }
      }
      return { text: t("fallback"), topic: null };
    },
    [buildKB, t],
  );

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [aiMsgs, isOpen, isTyping]);

  // Reset chat when language changes
  useEffect(() => {
    if (aiMsgs.length > 0) {
      setAiMsgs([{ sender: "bot", text: t("welcome"), ts: Date.now() }]);
    }
  }, [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen && aiMsgs.length === 0)
      setAiMsgs([{ sender: "bot", text: t("welcome"), ts: Date.now() }]);
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendAI = useCallback(
    (text) => {
      setAiMsgs((prev) => [...prev, { sender: "user", text, ts: Date.now() }]);
      setIsTyping(true);
      setTimeout(
        () => {
          setAiMsgs((prev) => {
            const { text: responseText, topic } = getAIResponse(text, prev);
            return [
              ...prev,
              { sender: "bot", text: responseText, ts: Date.now(), topic },
            ];
          });
          setIsTyping(false);
        },
        700 + Math.random() * 500,
      );
    },
    [getAIResponse],
  );

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    sendAI(message);
    setMessage("");
  };

  const quickActions = t("quickActions", { returnObjects: true });

  return (
    <div className="cs-wrapper">
      {isOpen && (
        <div className="cs-window">
          {/* Header */}
          <div className="cs-header">
            <div className="cs-header-left">
              <div className="cs-avatar-wrap">
                <i className="bi bi-stars cs-avatar-icon" />
                <span className="cs-online-dot" />
              </div>
              <div>
                <div className="cs-header-name">{t("headerName")}</div>
                <div className="cs-header-sub">{t("headerSub")}</div>
              </div>
            </div>
            <button className="cs-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="cs-body" ref={bodyRef}>
            {aiMsgs.map((msg, i) => (
              <div
                key={i}
                className={`cs-row ${msg.sender === "user" ? "cs-row-user" : "cs-row-bot"}`}
              >
                {msg.sender === "bot" && (
                  <div className="cs-bot-icon">
                    <i className="bi bi-stars" />
                  </div>
                )}
                <div className="cs-bubble">
                  {msg.sender === "bot" ? (
                    <div
                      className="cs-bubble-text"
                      dangerouslySetInnerHTML={renderBotText(msg.text)}
                    />
                  ) : (
                    <div className="cs-bubble-text">{msg.text}</div>
                  )}
                  <div className="cs-ts">{fmtTime(msg.ts)}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="cs-row cs-row-bot">
                <div className="cs-bot-icon">
                  <i className="bi bi-stars" />
                </div>
                <div className="cs-bubble cs-typing-bubble">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {aiMsgs.length <= 1 && !isTyping && (
              <div className="cs-quick-wrap">
                <p className="cs-quick-label">{t("quickLabel")}</p>
                <div className="cs-quick-grid">
                  {quickActions.map((qa, i) => (
                    <button
                      key={i}
                      className="cs-quick-btn"
                      onClick={() => sendAI(qa.query)}
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <form className="cs-footer" onSubmit={handleSend}>
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("placeholder")}
            />
            <button type="submit" disabled={!message.trim()}>
              <i className="bi bi-send-fill" />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="cs-trigger" onClick={() => setIsOpen(true)}>
          <i className="bi bi-chat-dots-fill" />
        </button>
      )}
    </div>
  );
};

export default ChatSupport;
