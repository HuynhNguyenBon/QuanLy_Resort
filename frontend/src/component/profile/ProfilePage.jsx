import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const ROOM_LIMITS = {
  "Standard":    { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  "Superior":    { maxAdults: 2, maxChildren: 2, maxTotal: 3 },
  "Deluxe":      { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
  "Suite":       { maxAdults: 4, maxChildren: 3, maxTotal: 5 },
  "Family":      { maxAdults: 4, maxChildren: 4, maxTotal: 6 },
  "King":        { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  "Queen":       { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  "Studio":      { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  "Executive":   { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
  "Precidential":{ maxAdults: 6, maxChildren: 4, maxTotal: 8 },
  "Bali":        { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
};
const getLimit = (t) => ROOM_LIMITS[t] || { maxAdults: 2, maxChildren: 2, maxTotal: 3 };

const ProfilePage = () => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const [user,         setUser]         = useState(null);
  const [editBooking,  setEditBooking]  = useState(null);
  const [editCheckIn,  setEditCheckIn]  = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editAdults,   setEditAdults]   = useState(1);
  const [editChildren, setEditChildren] = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState({ text: "", type: "" });

  const fetchProfile = async () => {
    try {
      const res  = await ApiService.getUserProfile();
      const full = await ApiService.getUserBookings(res.user.id);
      const u = full.user;
      // Merge data đã lưu local (khi backend 403)
      const localName  = localStorage.getItem("userName");
      const localPhone = localStorage.getItem("userPhone");
      setUser({
        ...u,
        name:        localName  || u.name,
        phoneNumber: localPhone || u.phoneNumber,
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  };

  const activeBookings = (user?.bookings || []).filter(b => {
    const s = (b.bookingStatus || b.status || "").toString().toLowerCase();
    return s !== "cancelled" && s !== "canceled" && s !== "false" && s !== "0";
  });

  const getNights = (ci, co) => {
    try { return Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000)); }
    catch { return 1; }
  };

  const handlePayNow = async (booking) => {
    try {
      const paymentRes = await ApiService.createVNPayPayment(booking.id);
      if (paymentRes.status === "OK") {
        window.location.href = paymentRes.paymentUrl;
      } else {
        showMsg("Không thể tạo link thanh toán. Vui lòng thử lại.", "error");
      }
    } catch (err) {
      showMsg("Lỗi thanh toán: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đặt phòng này không?")) return;
    try {
      await ApiService.cancelBooking(bookingId);
      showMsg("Đã hủy đặt phòng thành công.");
      fetchProfile();
    } catch (err) {
      showMsg("Hủy thất bại: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const openEdit = (booking) => {
    setEditBooking(booking);
    setEditCheckIn(booking.checkInDate);
    setEditCheckOut(booking.checkOutDate);
    setEditAdults(booking.numOfAdults || 1);
    setEditChildren(booking.numOfChildren || 0);
  };

  const handleSaveEdit = async () => {
    if (!editCheckIn || !editCheckOut) { showMsg("Vui lòng chọn đầy đủ ngày.", "error"); return; }
    if (new Date(editCheckIn) >= new Date(editCheckOut)) { showMsg("Ngày trả phòng phải sau ngày nhận.", "error"); return; }
    setSaving(true);
    try {
      await ApiService.updateBooking(editBooking.id, {
        checkInDate: editCheckIn, checkOutDate: editCheckOut,
        numOfAdults: editAdults,  numOfChildren: editChildren,
      });
      showMsg("Cập nhật thành công!");
      setEditBooking(null);
      fetchProfile();
    } catch (err) {
      showMsg("Cập nhật thất bại: " + (err.response?.data?.message || err.message), "error");
    } finally { setSaving(false); }
  };

  const getStatusBadge = (booking) => {
    const s = (booking.bookingStatus || booking.status || "").toString().toLowerCase();
    if (s === "confirmed" || s === "true" || s === "1")
      return <span className="pf-status-badge confirmed">✓ Đã xác nhận</span>;
    return <span className="pf-status-badge pending">⏳ Chờ thanh toán</span>;
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="pf-page">

      {/* Toast */}
      {msg.text && (
        <div className={`pf-toast ${msg.type}`}>
          {msg.type === "error" ? "⚠️" : "✅"} {msg.text}
        </div>
      )}

      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-hero-inner">
          <div className="pf-avatar">{avatarLetter}</div>
          <div className="pf-hero-info">
            <h1 className="pf-hero-name">
              {t("welcome")}, <span>{user?.name || "..."}</span>
            </h1>
            <p className="pf-hero-email">{user?.email}</p>
          </div>
          <button className="pf-btn-logout" onClick={() => { ApiService.logout(); navigate("/home"); }}>
            🚪 {t("logout")}
          </button>
        </div>
      </div>

      <div className="pf-body">

        {/* Stats */}
        <div className="pf-stats">
          {[
            { num: activeBookings.length, lbl: "Đặt phòng" },
            { num: activeBookings.filter(b => { const s=(b.bookingStatus||b.status||"").toLowerCase(); return s==="confirmed"||s==="true"||s==="1"; }).length, lbl: "Đã xác nhận" },
            { num: activeBookings.reduce((s,b)=>s+getNights(b.checkInDate,b.checkOutDate),0), lbl: "Đêm lưu trú" },
            { num: user?.phoneNumber ? "✓" : "—", lbl: "SĐT xác minh" },
          ].map((s,i) => (
            <div key={i} className="pf-stat">
              <span className="pf-stat-num">{s.num}</span>
              <span className="pf-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>

        <div className="pf-grid">

          {/* Cột trái: info */}
          <div className="pf-card">
            <h2 className="pf-card-title">👤 Thông tin cá nhân</h2>
            <div className="pf-info-list">
              <div className="pf-info-row">
                <span className="pf-info-icon">📧</span>
                <div><label>Email</label><strong>{user?.email||"—"}</strong></div>
              </div>
              <div className="pf-info-row">
                <span className="pf-info-icon">📱</span>
                <div><label>Số điện thoại</label><strong>{user?.phoneNumber||"Chưa cập nhật"}</strong></div>
              </div>
            </div>
            <button className="pf-edit-full-btn" onClick={() => navigate("/edit-profile")}>
              ✎ Chỉnh sửa hồ sơ →
            </button>
          </div>

          {/* Cột phải: bookings */}
          <div className="pf-card pf-card-wide">
            <div className="pf-card-header">
              <h2 className="pf-card-title">🛏️ {t("bookingHistory")}</h2>
              {activeBookings.length > 0 &&
                <span className="pf-count-badge">{activeBookings.length}</span>}
            </div>

            {activeBookings.length === 0 ? (
              <div className="pf-empty-state">
                <div className="pf-empty-icon">🏖️</div>
                <h3>Chưa có đặt phòng nào</h3>
                <p>Khám phá các phòng nghỉ tuyệt vời tại BBHH Resort</p>
                <button className="btn-gold" style={{ fontSize: "14px", padding: "10px 24px" }}
                  onClick={() => navigate("/rooms")}>Đặt phòng ngay →</button>
              </div>
            ) : (
              <div className="pf-booking-list">
                {activeBookings.map(booking => {
                  const nights = getNights(booking.checkInDate, booking.checkOutDate);
                  const guests = (booking.numOfAdults||0) + (booking.numOfChildren||0);
                  return (
                    <div key={booking.id} className="pf-booking-card">
                      {/* Ảnh */}
                      <div className="pf-booking-img">
                        <img src={booking.room?.roomPhotoUrl} alt={booking.room?.roomType}/>
                        <span className="pf-room-type-badge">{booking.room?.roomType}</span>
                      </div>
                      {/* Chi tiết */}
                      <div className="pf-booking-details">
                        <div className="pf-booking-top">
                          <span className="pf-booking-code">{booking.bookingConfirmationCode}</span>
                          {getStatusBadge(booking)}
                        </div>
                        <div className="pf-booking-meta">
                          <div className="pf-meta-item">
                            <span>📅</span>
                            <span>{booking.checkInDate} → {booking.checkOutDate}</span>
                            <span className="pf-nights">{nights} đêm</span>
                          </div>
                          <div className="pf-meta-item">
                            <span>👥</span>
                            <span>
                              {guests} khách ({booking.numOfAdults||0} người lớn
                              {(booking.numOfChildren||0) > 0 ? `, ${booking.numOfChildren} trẻ em` : ""})
                            </span>
                          </div>
                        </div>
                        <div className="pf-booking-actions">
                          {(() => {
                            const s = (booking.bookingStatus || booking.status || "").toString().toLowerCase();
                            const isPending = s !== "confirmed" && s !== "true" && s !== "1";
                            return isPending && (
                              <button className="pf-action-btn pay" onClick={() => handlePayNow(booking)}>
                                💳 Thanh toán
                              </button>
                            );
                          })()}
                          <button className="pf-action-btn edit" onClick={() => openEdit(booking)}>✎ Sửa</button>
                          <button className="pf-action-btn cancel" onClick={() => handleCancel(booking.id)}>✕ Hủy</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {editBooking && (
        <div className="pf-modal-bg" onClick={() => setEditBooking(null)}>
          <div className="pf-modal" onClick={e => e.stopPropagation()}>
            <div className="pf-modal-header">
              <h3>✎ Sửa đặt phòng</h3>
              <button className="pf-modal-close" onClick={() => setEditBooking(null)}>✕</button>
            </div>
            <div style={{ padding: "0 20px" }}>
              <p className="pf-modal-sub">
                <strong>{editBooking.bookingConfirmationCode}</strong> · {editBooking.room?.roomType}
              </p>
              {(() => {
                const lim = getLimit(editBooking?.room?.roomType);
                const over = editAdults + editChildren > lim.maxTotal;
                return (
                  <>
                    <div className="pf-modal-section">
                      <div className="pf-modal-section-label">📅 Ngày lưu trú</div>
                      <div className="pf-modal-row">
                        <div className="auth-field">
                          <label>Nhận phòng</label>
                          <input type="date" value={editCheckIn}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={e => setEditCheckIn(e.target.value)} />
                        </div>
                        <div className="auth-field">
                          <label>Trả phòng</label>
                          <input type="date" value={editCheckOut} min={editCheckIn}
                            onChange={e => setEditCheckOut(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="pf-modal-section">
                      <div className="pf-modal-section-label">
                        👥 Số lượng khách <span className="room-limit-badge">Tối đa {lim.maxTotal}</span>
                      </div>
                      <div className="pf-modal-row">
                        <div className="auth-field">
                          <label>Người lớn <span className="room-limit-badge">≤{lim.maxAdults}</span></label>
                          <div className="guest-counter">
                            <button type="button" className="guest-btn" onClick={() => setEditAdults(Math.max(1, editAdults-1))}>−</button>
                            <span className="guest-num">{editAdults}</span>
                            <button type="button" className="guest-btn" onClick={() => {
                              if (editAdults+1 > lim.maxAdults) return;
                              if (editAdults+1+editChildren > lim.maxTotal) return;
                              setEditAdults(editAdults+1);
                            }}>+</button>
                          </div>
                        </div>
                        <div className="auth-field">
                          <label>Trẻ em <span className="room-limit-badge">≤{lim.maxChildren}</span></label>
                          <div className="guest-counter">
                            <button type="button" className="guest-btn" onClick={() => setEditChildren(Math.max(0, editChildren-1))}>−</button>
                            <span className="guest-num">{editChildren}</span>
                            <button type="button" className="guest-btn" onClick={() => {
                              if (editChildren+1 > lim.maxChildren) return;
                              if (editAdults+editChildren+1 > lim.maxTotal) return;
                              setEditChildren(editChildren+1);
                            }}>+</button>
                          </div>
                        </div>
                      </div>
                      <div className={`pf-guest-total ${over ? "over" : ""}`}>
                        Tổng: <strong>{editAdults+editChildren}</strong> / {lim.maxTotal} người
                        {over && <span> ⚠️ Vượt giới hạn!</span>}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="pf-modal-footer">
              <button className="auth-submit-btn" onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
              <button className="pf-cancel-btn" onClick={() => setEditBooking(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
