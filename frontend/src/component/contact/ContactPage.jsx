import React, { useState } from "react";
import "../../UiverseElements.css";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-inner">
          <p className="contact-hero-tag">📞 LIÊN HỆ</p>
          <h1 className="contact-hero-h1">Chúng tôi luôn <span className="accent">sẵn sàng</span> hỗ trợ</h1>
          <p className="contact-hero-sub">Đội ngũ BBHH Resort phục vụ 24/7, hãy liên hệ bất cứ lúc nào</p>
        </div>
      </div>

      <div className="contact-body">
        <div className="contact-inner">
          <div className="contact-info-grid">
            {[
              { icon: "📍", label: "Địa chỉ", value: "123 Đường Biển Xanh, Quận 7", sub: "TP. Hồ Chí Minh, Việt Nam" },
              { icon: "📞", label: "Điện thoại", value: "+84 (028) 1234 5678", sub: "Hotline 24/7: 1800 6868" },
              { icon: "📧", label: "Email", value: "info@bbhhresort.com", sub: "booking@bbhhresort.com" },
              { icon: "🕐", label: "Giờ làm việc", value: "Lễ tân: 24/7", sub: "Văn phòng: 8:00 – 17:00" },
            ].map((item, i) => (
              <div key={i} className="contact-info-card">
                <span className="contact-info-icon">{item.icon}</span>
                <div>
                  <div className="contact-info-label">{item.label}</div>
                  <div className="contact-info-value">{item.value}</div>
                  <div className="contact-info-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-form-card">
            <h2 className="contact-form-title">Gửi tin nhắn cho chúng tôi</h2>
            {sent && (
              <div className="contact-success">
                ✅ Cảm ơn! Chúng tôi sẽ phản hồi trong vòng 24 giờ.
              </div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Họ và tên *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                </div>
                <div className="contact-field">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" required />
                </div>
              </div>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="0912 345 678" />
                </div>
                <div className="contact-field">
                  <label>Chủ đề *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Chọn chủ đề...</option>
                    <option>Đặt phòng</option>
                    <option>Dịch vụ</option>
                    <option>Ưu đãi & Khuyến mãi</option>
                    <option>Khiếu nại</option>
                    <option>Khác</option>
                  </select>
                </div>
              </div>
              <div className="contact-field">
                <label>Nội dung *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Nhập nội dung tin nhắn..."
                  required
                />
              </div>
              <button type="submit" className="contact-submit-btn">
                📨 Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
