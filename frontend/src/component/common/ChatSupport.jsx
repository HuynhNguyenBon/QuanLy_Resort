import React, { useState, useEffect, useRef, useCallback } from "react";
import { ref, push, onValue } from "firebase/database";
import { db } from "../../service/firebase";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../ChatSupport.css";

const ChatSupport = () => {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null);

  const chatBodyRef = useRef(null);
  const navigate = useNavigate();

  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getFreshUser = () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("role");

    if (token && email && role) {
      return {
        uid: email.replace(/[.$#[\]]/g, "_"),
        email,
        role: role.toLowerCase(),
      };
    }
    return null;
  };

  const syncUser = useCallback(() => {
    const freshUser = getFreshUser();

    if (!freshUser) {
      if (userRef.current !== null) {
        setIsOpen(false);
        setChatHistory([]);
        setUser(null);
      }
      return;
    }

    if (freshUser.role === "admin") {
      setIsOpen(false);
    }

    setUser((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(freshUser)) return prev;
      return freshUser;
    });
  }, []);

  useEffect(() => {
    syncUser();

    window.addEventListener("authChange", syncUser);

    const interval = setInterval(syncUser, 2000);

    return () => {
      window.removeEventListener("authChange", syncUser);
      clearInterval(interval);
    };
  }, [syncUser]);

  useEffect(() => {
    if (!user || user.role !== "user") return;

    const chatRef = ref(db, `chats/${user.uid}`);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const sorted = Object.values(data).sort(
          (a, b) => a.timestamp - b.timestamp,
        );

        setChatHistory(sorted);
      } else {
        setChatHistory([]);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, user?.role]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleTriggerClick = () => {
    const role = localStorage.getItem("role")?.toLowerCase();

    if (role === "admin") {
      navigate("/admin/chat");
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();

    if (!user || !message.trim()) return;

    push(ref(db, `chats/${user.uid}`), {
      text: message,
      sender: "user",
      timestamp: Date.now(),
    });

    setMessage("");
  };

  return (
    <div className="chat-support-wrapper">
      {isOpen && (
        <div className="chat-window-v2">
          <div className="chat-header">
            <span>{t("chat.header")}</span>

            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {user ? (
              <div className="messages-container">
                {chatHistory.length === 0 ? (
                  <p className="empty-chat">{t("chat.empty")}</p>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`message ${
                        msg.sender === "user" ? "user-msg" : "admin-msg"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="login-required-container">
                <div className="lock-icon-circle">
                  <i className="bi bi-lock-fill"></i>
                </div>

                <p>{t("chat.needLogin")}</p>

                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="login-button-fancy"
                >
                  {t("chat.login")}
                </Link>
              </div>
            )}
          </div>

          {user && (
            <form className="chat-footer" onSubmit={handleSendMessage}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("chat.placeholder")}
              />

              <button type="submit">
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          )}
        </div>
      )}

      {!isOpen && (
        <div className="chat-trigger" onClick={handleTriggerClick}>
          <i className="bi bi-chat-dots-fill"></i>
        </div>
      )}
    </div>
  );
};

export default ChatSupport;
