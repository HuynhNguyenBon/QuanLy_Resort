import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../ChatSupport.css";

// ── AI Knowledge Base ────────────────────────────────────────────
const AI_KB = [
  {
    patterns: ["chào", "hello", "hi", "xin chào", "hey", "alo"],
    topic: "greeting",
    response: "Xin chào! Tôi là **BBHH Assistant** 🤖\nRất vui được gặp bạn! Tôi có thể giúp bạn về phòng nghỉ, đặt phòng, giá cả và các dịch vụ tại resort. Bạn cần hỗ trợ gì hôm nay?"
  },
  {
    patterns: ["đặt phòng", "book", "booking", "reservation", "đặt lịch", "đặt trước"],
    topic: "booking",
    response: "Để đặt phòng tại BBHH Resort, bạn có thể:\n\n✅ Đặt trực tiếp tại mục **Phòng** trên website\n✅ Gọi hotline: **0123 456 789** (24/7)\n✅ Email: **booking@bbhh-resort.com**\n\nChúng tôi cần biết ngày check-in, check-out và số lượng khách để hỗ trợ bạn nhé!"
  },
  {
    patterns: ["giá", "price", "bao nhiêu", "chi phí", "cost", "phí", "tiền"],
    topic: "price",
    response: "Bảng giá phòng tại BBHH Resort:\n\n🏠 **Standard** — từ $80/đêm\n🏠 **Superior** — từ $120/đêm\n🏠 **Deluxe** — từ $180/đêm\n🌊 **Suite Hướng Biển** — từ $280/đêm\n👨‍👩‍👧 **Family** — từ $220/đêm\n👑 **Presidential** — từ $450/đêm\n\n💡 Giá có thể thay đổi theo mùa và ưu đãi. Liên hệ để được tư vấn giá tốt nhất!"
  },
  {
    patterns: ["phòng", "room", "suite", "deluxe", "standard", "loại phòng", "hạng phòng"],
    topic: "rooms",
    response: "BBHH Resort có đa dạng các loại phòng:\n\n🛏️ **Standard** — tối đa 2 người\n🛏️ **Superior** — tối đa 3 người\n🛏️ **Deluxe** — tối đa 4 người\n🌊 **Suite Hướng Biển** — tối đa 5 người\n👨‍👩‍👧 **Family** — tối đa 6 người\n👑 **Presidential** — tối đa 8 người\n\nMỗi phòng đều có Wi-Fi miễn phí, điều hòa, minibar và view đẹp!"
  },
  {
    patterns: ["hồ bơi", "pool", "bơi lội", "swim", "bể bơi"],
    topic: "pool",
    response: "🏊 **Hồ bơi tại BBHH Resort:**\n\n✨ Hồ bơi vô cực nhìn ra biển (mở 6:00 – 22:00)\n✨ Hồ bơi trẻ em (độ sâu 60cm)\n✨ Pool Bar phục vụ đồ uống tươi mát\n✨ Ghế nằm & dù che miễn phí\n\n🔒 Hồ bơi chỉ dành cho khách lưu trú tại resort."
  },
  {
    patterns: ["spa", "massage", "gym", "fitness", "thể dục", "thư giãn", "jacuzzi", "sauna", "yoga"],
    topic: "spa",
    response: "💆 **Trung tâm Spa & Gym BBHH:**\n\n🌸 **Spa**: Massage toàn thân, liệu pháp đá nóng, chăm sóc da\n💪 **Gym**: Thiết bị hiện đại, mở 5:00 – 23:00\n🧘 **Yoga**: Lớp học buổi sáng tại bãi biển (7:00 – 8:00)\n🛁 **Jacuzzi**: Bể sục thư giãn cao cấp\n🔥 **Sauna**: Phòng xông hơi khô & ướt\n\nĐặt lịch spa qua lễ tân để nhận ưu đãi!"
  },
  {
    patterns: ["nhà hàng", "ăn", "restaurant", "buffet", "food", "ẩm thực", "thức ăn", "menu", "bar", "cocktail"],
    topic: "restaurant",
    response: "🍽️ **Ẩm thực tại BBHH Resort:**\n\n☀️ **Buffet sáng** (6:30 – 10:00): 20+ món tươi ngon\n🌊 **Nhà hàng hải sản** (11:00 – 22:00)\n🍸 **Sky Bar** tầng thượng (17:00 – 24:00)\n🍷 **Wine & Dine** — bữa tối lãng mạn\n\n🎉 Đặt bàn trước để có vị trí view biển đẹp nhất!"
  },
  {
    patterns: ["ở đâu", "địa chỉ", "location", "where", "địa điểm", "tọa lạc", "vị trí"],
    topic: "location",
    response: "📍 **BBHH Resort**\nĐịa chỉ: 123 Đường Biển, TP. Đà Nẵng, Việt Nam\n\n🚗 Cách sân bay Đà Nẵng: **15 phút** (12km)\n🏖️ Ngay mặt tiền bãi biển Mỹ Khê\n\n🚌 **Đưa đón sân bay miễn phí** cho khách đặt phòng!"
  },
  {
    patterns: ["liên hệ", "contact", "số điện thoại", "phone", "email", "hotline", "gọi"],
    topic: "contact",
    response: "📞 **Liên hệ BBHH Resort:**\n\n📱 Hotline: **0123 456 789** (24/7)\n📧 Email: **info@bbhh-resort.com**\n💬 Zalo / WhatsApp: **0123 456 789**\n\n⏰ Đội ngũ hỗ trợ 24/7, luôn sẵn sàng!"
  },
  {
    patterns: ["ưu đãi", "khuyến mãi", "discount", "promo", "sale", "giảm giá", "coupon", "voucher"],
    topic: "promo",
    response: "🎁 **Ưu đãi hiện có tại BBHH Resort:**\n\n⭐ Đặt sớm 30 ngày: giảm **15%**\n⭐ Lưu trú từ 3 đêm: giảm **10%**\n⭐ Combo phòng + Spa: tiết kiệm **20%**\n\n👉 Xem thêm tại mục **Ưu đãi** trên website!"
  },
  {
    patterns: ["check in", "check-in", "checkin", "nhận phòng", "trả phòng", "checkout"],
    topic: "checkin",
    response: "🕐 **Giờ nhận & trả phòng:**\n\n✅ **Check-in**: từ **14:00**\n✅ **Check-out**: trước **12:00**\n\n💡 Early check-in & Late check-out có thể sắp xếp theo yêu cầu. Liên hệ lễ tân trước nhé!"
  },
  {
    patterns: ["wifi", "wi-fi", "internet", "mạng", "kết nối"],
    topic: "wifi",
    response: "📶 **Wi-Fi tại BBHH Resort:**\n\nWi-Fi tốc độ cao miễn phí toàn resort:\n✅ Trong phòng, bãi biển, hồ bơi\n✅ Nhà hàng & Sky Bar\n✅ Lobby & khu vực công cộng\n\nMật khẩu được cung cấp khi check-in!"
  },
  {
    patterns: ["trẻ em", "trẻ con", "em bé", "child", "kid", "gia đình", "family"],
    topic: "family",
    response: "👨‍👩‍👧 **BBHH Resort thân thiện với gia đình:**\n\n✅ Phòng Family rộng rãi cho tối đa 6 người\n✅ Hồ bơi trẻ em an toàn (60cm)\n✅ Khu vui chơi trong nhà\n✅ Menu đặc biệt cho trẻ em\n✅ Miễn phí cho trẻ dưới 6 tuổi\n\nLiên hệ để được tư vấn phòng phù hợp!"
  },
  {
    patterns: ["bãi biển", "beach", "biển", "tắm biển"],
    topic: "beach",
    response: "🏖️ **Bãi biển BBHH Resort:**\n\n✨ Bãi biển riêng dài 500m\n✨ Cát trắng mịn, nước biển trong xanh\n✨ Cho thuê dù, ghế nằm, lướt sóng\n✨ Bar bãi biển phục vụ đồ uống\n✨ Nhân viên cứu hộ trực 24/7\n\n🌅 Hoàng hôn tại đây cực kỳ đẹp!"
  },
];

const QUICK_ACTIONS = [
  { label: "🏨 Đặt phòng",    query: "tôi muốn đặt phòng" },
  { label: "💰 Bảng giá",     query: "giá phòng bao nhiêu" },
  { label: "🏊 Hồ bơi & Spa", query: "hồ bơi và spa" },
  { label: "🍽️ Nhà hàng",     query: "nhà hàng ăn uống" },
  { label: "📍 Địa chỉ",      query: "địa chỉ resort ở đâu" },
  { label: "🎁 Ưu đãi",       query: "ưu đãi khuyến mãi" },
];

const WELCOME_MSG = {
  sender: "bot",
  text: "Xin chào! Tôi là **BBHH Assistant** 🤖\nTôi có thể giúp bạn tìm hiểu về phòng nghỉ, đặt phòng, dịch vụ spa, nhà hàng và nhiều hơn nữa.\n\nHãy chọn chủ đề bên dưới hoặc gõ câu hỏi của bạn! 😊",
  ts: Date.now(),
};

// Context-aware AI response
const getAIResponse = (input, history) => {
  const lower = input.toLowerCase();

  // Direct match first
  for (const item of AI_KB) {
    if (item.patterns.some((p) => lower.includes(p))) return item.response;
  }

  // Context follow-up: short queries like "bao nhiêu?", "ở đâu?", "như thế nào?"
  const followUpKeywords = ["bao nhiêu", "như thế nào", "thế nào", "sao", "ở đâu", "có không", "được không", "thêm", "nữa"];
  const isFollowUp = followUpKeywords.some((k) => lower.includes(k)) || lower.length < 20;

  if (isFollowUp && history.length > 0) {
    // Find last bot message's topic
    const lastBotMsg = [...history].reverse().find((m) => m.sender === "bot" && m.topic);
    if (lastBotMsg?.topic) {
      const related = AI_KB.find((item) => item.topic === lastBotMsg.topic);
      if (related) return related.response;
    }
  }

  return "Cảm ơn bạn đã liên hệ! Tôi chưa có câu trả lời cho câu hỏi này.\n\nBạn có thể liên hệ trực tiếp:\n📞 Hotline: **0123 456 789**\n📧 Email: **info@bbhh-resort.com**";
};

const renderBotText = (text) => ({
  __html: text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>"),
});

const fmtTime = (ts) =>
  new Date(ts || Date.now()).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

// ── Component ────────────────────────────────────────────────────
const ChatSupport = () => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [message,  setMessage]  = useState("");
  const [aiMsgs,   setAiMsgs]   = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const bodyRef  = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const getFreshUser = () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const role  = localStorage.getItem("role");
    if (token && email && role)
      return { role: role.toLowerCase() };
    return null;
  };

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [aiMsgs, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen && aiMsgs.length === 0) setAiMsgs([WELCOME_MSG]);
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendAI = useCallback((text) => {
    setAiMsgs((prev) => [...prev, { sender: "user", text, ts: Date.now() }]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const matched = AI_KB.find((item) => item.patterns.some((p) => lower.includes(p)));
      setAiMsgs((prev) => {
        const responseText = getAIResponse(text, prev);
        return [...prev, { sender: "bot", text: responseText, ts: Date.now(), topic: matched?.topic }];
      });
      setIsTyping(false);
    }, 700 + Math.random() * 500);
  }, []);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    sendAI(message);
    setMessage("");
  };

  const handleTrigger = () => {
    const fresh = getFreshUser();
    setIsOpen(true);
  };

  return (
    <div className="cs-wrapper">
      {isOpen && (
        <div className="cs-window">
          {/* ── Header ── */}
          <div className="cs-header">
            <div className="cs-header-left">
              <div className="cs-avatar-wrap">
                <i className="bi bi-stars cs-avatar-icon" />
                <span className="cs-online-dot" />
              </div>
              <div>
                <div className="cs-header-name">BBHH Concierge</div>
                <div className="cs-header-sub">Trợ lý Resort · Luôn sẵn sàng</div>
              </div>
            </div>
            <button className="cs-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* ── Body ── */}
          <div className="cs-body" ref={bodyRef}>
            {aiMsgs.map((msg, i) => (
              <div key={i} className={`cs-row ${msg.sender === "user" ? "cs-row-user" : "cs-row-bot"}`}>
                {msg.sender === "bot" && <div className="cs-bot-icon"><i className="bi bi-stars" /></div>}
                <div className="cs-bubble">
                  {msg.sender === "bot"
                    ? <div className="cs-bubble-text" dangerouslySetInnerHTML={renderBotText(msg.text)} />
                    : <div className="cs-bubble-text">{msg.text}</div>
                  }
                  <div className="cs-ts">{fmtTime(msg.ts)}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="cs-row cs-row-bot">
                <div className="cs-bot-icon"><i className="bi bi-stars" /></div>
                <div className="cs-bubble cs-typing-bubble">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {aiMsgs.length <= 1 && !isTyping && (
              <div className="cs-quick-wrap">
                <p className="cs-quick-label">Câu hỏi thường gặp:</p>
                <div className="cs-quick-grid">
                  {QUICK_ACTIONS.map((qa, i) => (
                    <button key={i} className="cs-quick-btn" onClick={() => sendAI(qa.query)}>
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <form className="cs-footer" onSubmit={handleSend}>
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hỏi BBHH Assistant..."
            />
            <button type="submit" disabled={!message.trim()}>
              <i className="bi bi-send-fill" />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="cs-trigger" onClick={handleTrigger}>
          <i className="bi bi-chat-dots-fill" />
        </button>
      )}
    </div>
  );
};

export default ChatSupport;
