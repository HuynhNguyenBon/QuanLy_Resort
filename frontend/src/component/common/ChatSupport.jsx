import React, { useState, useEffect, useRef } from 'react';
import { ref, push, onValue } from "firebase/database";
import { db } from "../../service/firebase";
import { Link, useNavigate } from 'react-router-dom';
import '../../ChatSupport.css';

const ChatSupport = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [user, setUser] = useState(null);
    const chatBodyRef = useRef(null);
    const navigate = useNavigate();

    const getFreshUser = () => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("role");
        
        if (token && email && role) { 
            return { 
                uid: email.replace(/[.$#[\]]/g, "_"), 
                email: email,
                role: role.toLowerCase() 
            };
        }
        return null;
    };

    useEffect(() => {
        const syncUser = () => {
            const freshUser = getFreshUser();
            if (!freshUser) {
                setUser(null);
                setChatHistory([]);
            } else if (JSON.stringify(freshUser) !== JSON.stringify(user)) {
                setUser(freshUser);
            }
        };
        const interval = setInterval(syncUser, 1000); 
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (!user || user.role !== "user") return;
        const chatRef = ref(db, `chats/${user.uid}`);
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sortedMsgs = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
                setChatHistory(sortedMsgs);
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
            setIsOpen(prev => !prev);
        }
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!user || !message.trim()) return;
        push(ref(db, `chats/${user.uid}`), {
            text: message,
            sender: "user", 
            timestamp: Date.now()
        });
        setMessage("");
    };

    return (
        <div className="chat-support-wrapper">
            {isOpen && (
                <div className="chat-window-v2">
                    <div className="chat-header">
                        <span>Hỗ trợ khách hàng</span>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="chat-body" ref={chatBodyRef}>
                        {user ? (
                            <div className="messages-container">
                                {chatHistory.length === 0 ? (
                                    <p className="empty-chat">Hãy bắt đầu trò chuyện!</p>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div 
                                            key={i} 
                                            className={`message ${msg.sender === 'user' ? 'user-msg' : 'admin-msg'}`}
                                        >
                                            {msg.text}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="login-required-container">
                                <div className="lock-icon-circle"><i className="bi bi-lock-fill"></i></div>
                                <p>Bạn cần đăng nhập để chat</p>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="login-button-fancy">Đăng nhập</Link>
                            </div>
                        )}
                    </div>

                    {user && (
                        <form className="chat-footer" onSubmit={handleSendMessage}>
                            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nhập tin nhắn..." />
                            <button type="submit"><i className="bi bi-send-fill"></i></button>
                        </form>
                    )}
                </div>
            )}
            <div className="chat-trigger" onClick={handleTriggerClick}>
                <i className="bi bi-chat-dots-fill"></i>
            </div>
        </div>
    );
};

export default ChatSupport;