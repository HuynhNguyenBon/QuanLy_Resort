import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const STEPS = [
  {
    icon: "📧",
    title: "Kiểm tra email",
    desc: "Mã xác nhận được gửi vào email khi bạn đặt phòng thành công.",
  },
  {
    icon: "🔑",
    title: "Nhập mã xác nhận",
    desc: "Dán hoặc gõ mã vào ô tìm kiếm bên trên (ví dụ: ABC123456).",
  },
  {
    icon: "✅",
    title: "Xem thông tin",
    desc: "Hệ thống sẽ hiển thị đầy đủ thông tin đặt phòng của bạn.",
  },
];

const FindBookingPage = () => {
  const { t } = useTranslation("rooms");
  const navigate = useNavigate();

  const [confirmationCode, setConfirmationCode] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [showEmailLookup, setShowEmailLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupError, setLookupError] = useState("");

  const isPending = (booking) => {
    const p = (booking.paymentStatus || "").toString().toUpperCase();
    if (p === "PAID") return false;
    const s = (booking.bookingStatus || booking.status || "")
      .toString()
      .toLowerCase();
    return s !== "confirmed" && s !== "true" && s !== "1";
  };

  const handlePayNow = async () => {
    if (!ApiService.isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/find-booking" } } });
      return;
    }
    setPayLoading(true);
    try {
      const res = await ApiService.createVNPayPayment(bookingDetails.id);
      if (res.status === "OK") {
        window.location.href = res.paymentUrl;
      } else {
        setError("Không thể tạo link thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Lỗi thanh toán. Vui lòng thử lại.",
      );
    } finally {
      setPayLoading(false);
    }
  };

  const handleEmailLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    setLookupLoading(true);
    setLookupError("");
    setLookupResults([]);
    try {
      // Lấy tất cả booking của user có email này
      const res = await ApiService.getAllBookings();
      const allBookings = res.bookingList || [];
      const matched = allBookings.filter(
        (b) =>
          b.user?.email?.toLowerCase() === lookupEmail.trim().toLowerCase(),
      );
      if (matched.length === 0) {
        setLookupError(
          "Không tìm thấy đặt phòng nào với email này. Kiểm tra lại hoặc liên hệ hỗ trợ.",
        );
      } else {
        setLookupResults(matched);
      }
    } catch (err) {
      // Nếu không có quyền gọi getAllBookings, hướng dẫn liên hệ
      setLookupError(
        "Không thể tra cứu tự động. Vui lòng liên hệ 0909.448.608 hoặc gửi yêu cầu hỗ trợ bên dưới.",
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSending(true);
    try {
      // Gửi email qua mailto (mở email client)
      const subject = encodeURIComponent(
        `[BBHH Resort] Hỗ trợ tìm đặt phòng - ${contactForm.name}`,
      );
      const body = encodeURIComponent(
        `Họ tên: ${contactForm.name}\n` +
          `Email: ${contactForm.email}\n\n` +
          `Nội dung:\n${contactForm.message}\n\n` +
          `---\nGửi từ trang Tìm đặt phòng - BBHH Resort`,
      );
      window.location.href = `mailto:support@bbhh.com?subject=${subject}&body=${body}`;
      setContactSuccess(true);
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setContactSuccess(false);
        setShowContact(false);
      }, 3000);
    } finally {
      setContactSending(false);
    }
  };

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
      const response =
        await ApiService.getBookingByConfirmationCode(confirmationCode);
      setBookingDetails(response.booking);
      // Scroll xuống kết quả
      setTimeout(
        () =>
          document
            .getElementById("fb-result")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError("Không tìm thấy đặt phòng với mã này. Vui lòng kiểm tra lại.");
      } else {
        setError(
          err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.",
        );
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
                onChange={(e) =>
                  setConfirmationCode(e.target.value.toUpperCase())
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                maxLength={20}
                autoComplete="off"
              />
              {confirmationCode && (
                <button
                  className="fb-input-clear"
                  onClick={() => {
                    setConfirmationCode("");
                    setBookingDetails(null);
                    setError("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              className="fb-btn-search"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Đang tìm..." : "Tìm đặt phòng"}
            </button>
          </div>

          {error && <div className="fb-error-msg">⚠️ {error}</div>}
        </div>
      </div>

      {/* ── KẾT QUẢ ── */}
      {bookingDetails && (
        <div className="fb-result-section" id="fb-result">
          <div className="fb-result-card">
            <div className="fb-result-top">
              <div className="fb-confirmed-badge">✓ Đặt phòng đã xác nhận</div>
              <span className="fb-result-code">
                Mã: <strong>{bookingDetails.bookingConfirmationCode}</strong>
              </span>
            </div>

            <div className="fb-result-grid">
              {/* Ảnh */}
              <div className="fb-room-img-wrap">
                <img
                  src={bookingDetails.room.roomPhotoUrl}
                  alt={bookingDetails.room.roomType}
                />
                <span className="fb-room-badge">
                  {bookingDetails.room.roomType}
                </span>
              </div>

              {/* Thông tin */}
              <div className="fb-result-info">
                <div className="fb-info-block">
                  <h3 className="fb-info-title">📅 Thông tin đặt phòng</h3>
                  <div className="fb-field">
                    <label>Mã xác nhận</label>
                    <span style={{ color: "var(--amber)", fontWeight: 700 }}>
                      {bookingDetails.bookingConfirmationCode}
                    </span>
                  </div>
                  <div className="fb-field">
                    <label>Nhận phòng</label>
                    <span className="fb-teal">
                      {bookingDetails.checkInDate}
                    </span>
                  </div>
                  <div className="fb-field">
                    <label>Trả phòng</label>
                    <span className="fb-teal">
                      {bookingDetails.checkOutDate}
                    </span>
                  </div>
                  <div className="fb-field">
                    <label>Số khách</label>
                    <span>
                      {bookingDetails.numOfAdults} người lớn
                      {bookingDetails.numOfChildren > 0
                        ? ` · ${bookingDetails.numOfChildren} trẻ em`
                        : ""}
                    </span>
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
              🏨 Cảm ơn bạn đã chọn BBHH Resort. Chúc bạn có một kỳ nghỉ tuyệt
              vời!
            </div>
            <div className="fb-result-actions">
              {isPending(bookingDetails) ? (
                <>
                  <div className="fb-pay-banner">
                    <div className="fb-pay-banner-info">
                      <span>⏳</span>
                      <div>
                        <strong>Booking chưa được thanh toán</strong>
                        <p>Hoàn tất thanh toán để xác nhận chỗ ở của bạn</p>
                      </div>
                    </div>
                    <button
                      className="fb-pay-now-btn"
                      onClick={handlePayNow}
                      disabled={payLoading}
                    >
                      {payLoading ? "Đang xử lý..." : "💳 Thanh toán ngay"}
                    </button>
                  </div>
                  <button
                    className="fb-action-btn ghost"
                    onClick={() => {
                      setBookingDetails(null);
                      setConfirmationCode("");
                    }}
                  >
                    🔍 Tra cứu mã khác
                  </button>
                </>
              ) : (
                <>
                  <div className="fb-confirmed-banner">
                    <span>✅</span>
                    <div>
                      <strong>Booking đã được xác nhận</strong>
                      <p>Chúc bạn có kỳ nghỉ tuyệt vời tại BBHH Resort!</p>
                    </div>
                  </div>
                  <div className="fb-action-row">
                    <button
                      className="fb-action-btn primary"
                      onClick={() => navigate("/profile")}
                    >
                      👤 Quản lý đặt phòng
                    </button>
                    <button
                      className="fb-action-btn ghost"
                      onClick={() => {
                        setBookingDetails(null);
                        setConfirmationCode("");
                      }}
                    >
                      🔍 Tra cứu mã khác
                    </button>
                  </div>
                </>
              )}
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

              {/* Form tra cứu theo email */}
              {showEmailLookup && (
                <div className="fb-email-lookup">
                  <h4 className="fb-lookup-title">
                    📧 Tìm mã xác nhận theo email
                  </h4>
                  <p className="fb-lookup-sub">
                    Nhập email bạn dùng khi đặt phòng để tìm lại mã xác nhận.
                  </p>
                  <form onSubmit={handleEmailLookup} className="fb-lookup-form">
                    <input
                      type="email"
                      className="fb-lookup-input"
                      placeholder="email@gmail.com"
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="fb-lookup-btn"
                      disabled={lookupLoading}
                    >
                      {lookupLoading ? "Đang tìm..." : "🔍 Tìm kiếm"}
                    </button>
                  </form>

                  {lookupError && (
                    <p className="fb-lookup-error">⚠️ {lookupError}</p>
                  )}

                  {lookupResults.length > 0 && (
                    <div className="fb-lookup-results">
                      <p className="fb-lookup-found">
                        Tìm thấy {lookupResults.length} đặt phòng:
                      </p>
                      {lookupResults.map((b) => (
                        <div
                          key={b.id}
                          className="fb-lookup-item"
                          onClick={() => {
                            setConfirmationCode(b.bookingConfirmationCode);
                            setShowEmailLookup(false);
                            // Auto search
                            setTimeout(
                              () =>
                                document
                                  .querySelector(".fb-search-btn")
                                  ?.click(),
                              100,
                            );
                          }}
                        >
                          <div className="fb-lookup-item-code">
                            {b.bookingConfirmationCode}
                          </div>
                          <div className="fb-lookup-item-info">
                            📅 {b.checkInDate} → {b.checkOutDate} · 🛏️{" "}
                            {b.room?.roomType}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cần hỗ trợ */}
            <div className="fb-support-box">
              <div className="fb-support-header">
                <div className="fb-support-icon">💬</div>
                <div className="fb-support-title-wrap">
                  <h3>Không tìm thấy mã xác nhận?</h3>
                  <p>Kiểm tra hộp thư spam hoặc liên hệ với chúng tôi</p>
                </div>
                <a href="tel:0909448608" className="fb-hotline-btn">
                  📞 0909.448.608
                </a>
              </div>

              <div className="fb-support-divider">
                <span>hoặc gửi yêu cầu hỗ trợ</span>
              </div>

              {contactSuccess ? (
                <div className="fb-support-success">
                  <span>✅</span>
                  <div>
                    <strong>Đã mở ứng dụng email!</strong>
                    <p>
                      Vui lòng nhấn Gửi trong email để hoàn tất yêu cầu hỗ trợ.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContact} className="fb-support-form">
                  <div className="fb-support-row">
                    <div className="fb-support-field">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="fb-support-field">
                      <label>Email của bạn</label>
                      <input
                        type="email"
                        placeholder="email@gmail.com"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="fb-support-field">
                    <label>Mô tả vấn đề</label>
                    <textarea
                      placeholder="VD: Tôi đã đặt phòng ngày 16/05 nhưng không nhận được email xác nhận..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          message: e.target.value,
                        }))
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="fb-support-submit"
                    disabled={contactSending}
                  >
                    {contactSending
                      ? "Đang mở email..."
                      : "📧 Gửi yêu cầu hỗ trợ"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindBookingPage;
