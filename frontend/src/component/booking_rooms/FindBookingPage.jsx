import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const STEPS = [
  { icon: "📧", title: "Kiểm tra email", desc: "Mã xác nhận được gửi vào email khi bạn đặt phòng thành công." },
  { icon: "🔑", title: "Nhập mã xác nhận", desc: "Dán hoặc gõ mã vào ô tìm kiếm bên trên (ví dụ: ABC123456)." },
  { icon: "✅", title: "Xem thông tin", desc: "Hệ thống sẽ hiển thị đầy đủ thông tin đặt phòng của bạn." },
];

const FindBookingPage = () => {
  const { t } = useTranslation("rooms");
  const navigate = useNavigate();

  const [confirmationCode, setConfirmationCode] = useState("");
  const [bookingDetails,   setBookingDetails]   = useState(null);
  const [error,            setError]            = useState("");
  const [loading,          setLoading]          = useState(false);

  const handleSearch = async () => {
    if (!confirmationCode.trim()) {
      setError("Vui lòng nhập mã xác nhận đặt phòng.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    setLoading(true);
    setError("");
    setBookingDetails(null);
    try {
      const response = await ApiService.getBookingByConfirmationCode(confirmationCode);
      setBookingDetails(response.booking);
      // Scroll xuống kết quả
      setTimeout(() => document.getElementById("fb-result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError("Không tìm thấy đặt phòng với mã này. Vui lòng kiểm tra lại.");
      } else {
        setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fb-page">

      {/* ── HERO ── */}
      <div className="fb-hero">
        <div className="fb-hero-inner">
          <p className="fb-hero-tag">TRA CỨU ĐẶT PHÒNG</p>
          <h1 className="fb-hero-h1">
            Tìm <span className="accent">Đặt Phòng</span> của bạn
          </h1>
          <p className="fb-hero-sub">
            Nhập mã xác nhận để xem toàn bộ thông tin đặt phòng
          </p>

          {/* Search box */}
          <div className="fb-search-box">
            <div className="fb-input-wrap">
              <span className="fb-input-icon">🎫</span>
              <input
                type="text"
                className="fb-input"
                placeholder="Nhập mã xác nhận (VD: ABC123456)"
                value={confirmationCode}
                onChange={e => setConfirmationCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                maxLength={20}
                autoComplete="off"
              />
              {confirmationCode && (
                <button className="fb-input-clear" onClick={() => { setConfirmationCode(""); setBookingDetails(null); setError(""); }}>✕</button>
              )}
            </div>
            <button className="fb-btn-search" onClick={handleSearch} disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm đặt phòng"}
            </button>
          </div>

          {error && (
            <div className="fb-error-msg">⚠️ {error}</div>
          )}
        </div>
      </div>

      {/* ── KẾT QUẢ ── */}
      {bookingDetails && (
        <div className="fb-result-section" id="fb-result">
          <div className="fb-result-card">

            <div className="fb-result-top">
              <div className="fb-confirmed-badge">✓ Đặt phòng đã xác nhận</div>
              <span className="fb-result-code">Mã: <strong>{bookingDetails.bookingConfirmationCode}</strong></span>
            </div>

            <div className="fb-result-grid">
              {/* Ảnh */}
              <div className="fb-room-img-wrap">
                <img src={bookingDetails.room.roomPhotoUrl} alt={bookingDetails.room.roomType} />
                <span className="fb-room-badge">{bookingDetails.room.roomType}</span>
              </div>

              {/* Thông tin */}
              <div className="fb-result-info">

                <div className="fb-info-block">
                  <h3 className="fb-info-title">📅 Thông tin đặt phòng</h3>
                  <div className="fb-field">
                    <label>Mã xác nhận</label>
                    <span style={{ color: "var(--amber)", fontWeight: 700 }}>{bookingDetails.bookingConfirmationCode}</span>
                  </div>
                  <div className="fb-field">
                    <label>Nhận phòng</label>
                    <span className="fb-teal">{bookingDetails.checkInDate}</span>
                  </div>
                  <div className="fb-field">
                    <label>Trả phòng</label>
                    <span className="fb-teal">{bookingDetails.checkOutDate}</span>
                  </div>
                  <div className="fb-field">
                    <label>Số khách</label>
                    <span>{bookingDetails.numOfAdults} người lớn{bookingDetails.numOfChildren > 0 ? ` · ${bookingDetails.numOfChildren} trẻ em` : ""}</span>
                  </div>
                </div>

                <div className="fb-divider" />

                <div className="fb-info-block">
                  <h3 className="fb-info-title">👤 Thông tin khách hàng</h3>
                  <div className="fb-field">
                    <label>Họ và tên</label>
                    <span>{bookingDetails.user.name}</span>
                  </div>
                  <div className="fb-field">
                    <label>Email</label>
                    <span>{bookingDetails.user.email}</span>
                  </div>
                  <div className="fb-field">
                    <label>Số điện thoại</label>
                    <span>{bookingDetails.user.phoneNumber || "—"}</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="fb-result-footer">
              🏨 Cảm ơn bạn đã chọn BBHH Resort. Chúc bạn có một kỳ nghỉ tuyệt vời!
            </div>
          </div>
        </div>
      )}

      {/* ── HƯỚNG DẪN (ẩn khi có kết quả) ── */}
      {!bookingDetails && (
        <div className="fb-guide-section">
          <div className="fb-guide-inner">

            {/* Các bước */}
            <div className="fb-guide-steps">
              <h2 className="fb-guide-title">Cách tra cứu đặt phòng</h2>
              <div className="fb-steps-grid">
                {STEPS.map((s, i) => (
                  <div key={i} className="fb-step-card">
                    <div className="fb-step-num">{i + 1}</div>
                    <div className="fb-step-icon">{s.icon}</div>
                    <h3 className="fb-step-title">{s.title}</h3>
                    <p className="fb-step-desc">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cần hỗ trợ */}
            <div className="fb-help-box">
              <div className="fb-help-icon">💬</div>
              <div>
                <h3 className="fb-help-title">Không tìm thấy mã xác nhận?</h3>
                <p className="fb-help-desc">Kiểm tra hộp thư spam, hoặc liên hệ với chúng tôi để được hỗ trợ ngay.</p>
              </div>
              <div className="fb-help-actions">
                <a href="tel:0909448608" className="fb-help-btn primary">📞 0909.448.608</a>
                <button className="fb-help-btn secondary" onClick={() => navigate("/rooms")}>🛏️ Đặt phòng mới</button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FindBookingPage;
