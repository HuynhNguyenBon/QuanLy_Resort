import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, remove } from "firebase/database";
import { db } from "../../service/firebase";
import '../../ChatSupport.css';

const ManageChat = () => {
    const [chats, setChats] = useState({});
    const [activeUser, setActiveUser] = useState(null);
    const [reply, setReply] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onValue(ref(db, 'chats'), (snap) => {
            setChats(snap.val() || {});
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
        return () => clearTimeout(timer);
    }, [chats, activeUser]);

    const sendReply = (e) => {
        if (e) e.preventDefault();
        if (!reply.trim() || !activeUser) return;
        push(ref(db, `chats/${activeUser}`), {
            text: reply,
            sender: "admin",
            timestamp: Date.now()
        });
        setReply("");
    };

    const handleDeleteChat = (userId) => {
        if (window.confirm(`Xóa chat với ${userId}?`)) {
            remove(ref(db, `chats/${userId}`));
            if (activeUser === userId) setActiveUser(null);
        }
    };

    return (
        <div className="manage-chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">📩 Tin nhắn</div>
                <div className="user-list">
                    {Object.keys(chats).map(id => (
                        <div key={id} className={`user-item ${activeUser === id ? 'active' : ''}`} onClick={() => setActiveUser(id)}>
                            <span>{id.replace(/_/g, '.')}</span>
                            <i className="bi bi-trash3-fill delete-icon" onClick={(e) => { e.stopPropagation(); handleDeleteChat(id); }}></i>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {activeUser ? (
                    <>
                        <div className="messages-v3">
                            {Object.values(chats[activeUser])
                                .sort((a, b) => a.timestamp - b.timestamp)
                                .map((m, i) => (
                                    <div key={i} className={`message-row ${m.sender === 'admin' ? 'admin' : 'user'}`}>
                                        <div className="message-bubble-v3">
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="admin-input-area" onSubmit={sendReply}>
                            <input 
                                type="text" 
                                value={reply} 
                                onChange={(e) => setReply(e.target.value)} 
                                placeholder="Nhập câu trả lời..." 
                            />
                            <button type="submit"><i className="bi bi-send-fill"></i></button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">Chọn một khách hàng để chat</div>
                )}
            </div>
        </div>
    );
};

export default ManageChat;