import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../UiverseElements.css";

const today = () => new Date().toISOString().split("T")[0];

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const PROMOS = [
  {
    id: "early_bird",
    badge: "HOT", icon: "🌙", discount: "20%",
    title: "Đặt sớm 20% OFF",
    desc: "Đặt phòng trước 30 ngày để nhận ngay ưu đãi 20% cho mọi loại phòng. Áp dụng toàn bộ mùa.",
    conditions: ["Đặt trước ít nhất 30 ngày", "Không hoàn tiền khi hủy", "Áp dụng tất cả loại phòng"],
    preferredType: null,
    minDaysAdvance: 30,
    minNights: 1,
    path: "/rooms",
    hint: "Ngày nhận phòng phải cách hôm nay ít nhất 30 ngày.",
  },
  {
    id: "family",
    badge: "NEW", icon: "👨‍👩‍👧", discount: "15%",
    title: "Gói gia đình 15% OFF",
    desc: "Kỳ nghỉ lý tưởng cho cả gia đình! Giảm 15% khi đặt phòng Family hoặc Suite cho 4 người trở lên.",
    conditions: ["Tối thiểu 4 khách", "Phòng Family hoặc Suite", "Có thể hủy trước 48h"],
    preferredType: "Family",
    minDaysAdvance: 0,
    minNights: 1,
    path: "/rooms?type=Family",
    hint: "Ưu đãi áp dụng cho phòng Family. Trang phòng sẽ lọc sẵn loại phòng phù hợp.",
  },
  {
    id: "spa",
    badge: "DEAL", icon: "💆", discount: "FREE",
    title: "Spa miễn phí",
    desc: "Tặng 1 lần spa trị giá $50 khi đặt phòng Deluxe trở lên. Trải nghiệm thư giãn hoàn toàn miễn phí.",
    conditions: ["Phòng Deluxe, Suite hoặc Family", "1 lần spa / phòng", "Đặt lịch spa trước 24h"],
    preferredType: "Precidential",
    minDaysAdvance: 0,
    minNights: 1,
    path: "/rooms",
    hint: "Chọn phòng Deluxe trở lên để nhận ưu đãi spa miễn phí.",
  },
  {
    id: "weekend",
    badge: "NEW", icon: "🌊", discount: "10%",
    title: "Gói cuối tuần",
    desc: "Check-in thứ 6, check-out chủ nhật — nhận ngay 10% OFF và bữa sáng buffet miễn phí cho 2 người.",
    conditions: ["Nhận phòng đúng thứ 6", "Trả phòng đúng chủ nhật", "Đặt trước 7 ngày"],
    preferredType: null,
    minDaysAdvance: 7,
    minNights: 2,
    weekendOnly: true,
    path: "/rooms",
    hint: "Ngày nhận phòng phải là thứ 6, trả phòng chủ nhật.",
  },
  {
    id: "honeymoon",
    badge: "HOT", icon: "💑", discount: "25%",
    title: "Gói tuần trăng mật",
    desc: "Ưu đãi đặc biệt cho cặp đôi: 25% OFF + trang trí phòng + champagne + bữa tối lãng mạn.",
    conditions: ["Phòng Suite hoặc Deluxe", "Tối thiểu 2 đêm", "Xuất trình giấy đăng ký kết hôn"],
    preferredType: "Suit",
    minDaysAdvance: 0,
    minNights: 2,
    path: "/rooms?type=Suit",
    hint: "Tối thiểu 2 đêm. Trang phòng sẽ lọc sẵn phòng Suite.",
  },
  {
    id: "gym",
    badge: "DEAL", icon: "🏋️", discount: "FREE",
    title: "Gym & Yoga miễn phí",
    desc: "Truy cập không giới hạn phòng tập Gym và lớp Yoga khi lưu trú từ 3 đêm trở lên.",
    conditions: ["Lưu trú tối thiểu 3 đêm", "Mọi loại phòng", "Đăng ký tại quầy lễ tân"],
    preferredType: null,
    minDaysAdvance: 0,
    minNights: 3,
    path: "/rooms",
    hint: "Tối thiểu 3 đêm lưu trú để được sử dụng Gym & Yoga miễn phí.",
  },
];

const BADGE_COLORS = {
  HOT:  { bg: "#FEE2E2", color: "#991B1B" },
  NEW:  { bg: "#DCFCE7", color: "#166534" },
  DEAL: { bg: "#EDE9FE", color: "#5B21B6" },
};

const getNights = (ci, co) => {
  if (!ci || !co) return 0;
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000));
};

const getNextFriday = () => {
  const d = new Date();
  const day = d.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return d.toISOString().split("T")[0];
};

const getSundayAfter = (fridayStr) => {
  if (!fridayStr) return "";
  const d = new Date(fridayStr);
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};

const PromoPage = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const openModal = (promo) => {
    setError("");
    if (promo.weekendOnly) {
      const fri = getNextFriday();
      setCheckIn(fri);
      setCheckOut(getSundayAfter(fri));
    } else {
      setCheckIn(promo.minDaysAdvance > 0 ? addDays(promo.minDaysAdvance) : addDays(1));
      setCheckOut(promo.minNights > 1 ? addDays(promo.minDaysAdvance + promo.minNights) : addDays(promo.minDaysAdvance + 2));
    }
    setModal(promo);
  };

  const validate = () => {
    if (!checkIn || !checkOut) return "Vui lòng chọn đầy đủ ngày nhận và trả phòng.";

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const now = new Date(); now.setHours(0, 0, 0, 0);

    if (ci <= now) return "Ngày nhận phòng phải sau hôm nay.";
    if (co <= ci)  return "Ngày trả phòng phải sau ngày nhận phòng.";

    const nights = getNights(checkIn, checkOut);
    if (nights < modal.minNights)
      return `Ưu đãi này yêu cầu lưu trú tối thiểu ${modal.minNights} đêm.`;

    if (modal.minDaysAdvance > 0) {
      const daysAhead = Math.floor((ci - now) / 86400000);
      if (daysAhead < modal.minDaysAdvance)
        return `Ưu đãi này yêu cầu đặt trước ít nhất ${modal.minDaysAdvance} ngày.`;
    }

    if (modal.weekendOnly) {
      if (ci.getDay() !== 5) return "Ngày nhận phòng phải là thứ 6 (Friday).";
      if (co.getDay() !== 0) return "Ngày trả phòng phải là chủ nhật (Sunday).";
    }

    return null;
  };

  const handleConfirm = () => {
    const err = validate();
    if (err) { setError(err); return; }

    sessionStorage.setItem("bbhh_active_promo", JSON.stringify({
      id: modal.id,
      title: modal.title,
      discount: modal.discount,
      checkIn,
      checkOut,
      nights: getNights(checkIn, checkOut),
    }));

    setModal(null);
    navigate(modal.path);
  };

  const nights = getNights(checkIn, checkOut);

  return (
    <div className="promo-page">
      <div className="promo-hero">
        <div className="promo-hero-inner">
          <p className="promo-hero-tag">🏷️ ƯU ĐÃI ĐẶC BIỆT</p>
          <h1 className="promo-hero-h1">Khuyến mãi <span className="accent">độc quyền</span></h1>
          <p className="promo-hero-sub">Chọn ưu đãi phù hợp — chúng tôi sẽ kiểm tra điều kiện trước khi đặt phòng</p>
        </div>
      </div>

      <div className="promo-body">
        <div className="promo-inner">
          <div className="promo-grid">
            {PROMOS.map((p) => {
              const badgeStyle = BADGE_COLORS[p.badge] || BADGE_COLORS.DEAL;
              return (
                <div key={p.id} className="promo-card">
                  <div className="promo-card-top">
                    <span className="promo-card-badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                      {p.badge}
                    </span>
                    <div className="promo-card-icon">{p.icon}</div>
                    <div className="promo-card-discount">{p.discount}</div>
                    <h3 className="promo-card-title">{p.title}</h3>
                    <p className="promo-card-desc">{p.desc}</p>
                  </div>
                  <div className="promo-card-bottom">
                    <ul className="promo-conditions">
                      {p.conditions.map((c, j) => <li key={j}>✓ {c}</li>)}
                    </ul>
                    <button className="promo-card-btn" onClick={() => openModal(p)}>
                      Đặt ngay →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="promo-modal-bg" onClick={() => setModal(null)}>
          <div className="promo-modal" onClick={e => e.stopPropagation()}>
            <div className="promo-modal-header">
              <div className="promo-modal-icon">{modal.icon}</div>
              <div>
                <div className="promo-modal-title">{modal.title}</div>
                <div className="promo-modal-discount">{modal.discount} OFF</div>
              </div>
              <button className="promo-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {modal.hint && (
              <div className="promo-modal-hint">ℹ️ {modal.hint}</div>
            )}

            <div className="promo-modal-body">
              <div className="promo-modal-row">
                <div className="promo-modal-field">
                  <label>Ngày nhận phòng *</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={modal.minDaysAdvance > 0 ? addDays(modal.minDaysAdvance) : addDays(1)}
                    onChange={e => {
                      setCheckIn(e.target.value);
                      setError("");
                      if (modal.weekendOnly) setCheckOut(getSundayAfter(e.target.value));
                    }}
                  />
                </div>
                <div className="promo-modal-field">
                  <label>Ngày trả phòng *</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || addDays(2)}
                    readOnly={modal.weekendOnly}
                    onChange={e => { setCheckOut(e.target.value); setError(""); }}
                    style={modal.weekendOnly ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                  />
                </div>
              </div>

              {nights > 0 && (
                <div className="promo-modal-nights">
                  🌙 {nights} đêm lưu trú
                  {nights >= modal.minNights
                    ? <span className="promo-nights-ok"> · Đủ điều kiện ✓</span>
                    : <span className="promo-nights-fail"> · Cần tối thiểu {modal.minNights} đêm</span>}
                </div>
              )}

              {error && <div className="promo-modal-error">⚠️ {error}</div>}

              <div className="promo-modal-conditions">
                <div className="promo-modal-conditions-title">Điều kiện áp dụng:</div>
                <ul>
                  {modal.conditions.map((c, i) => <li key={i}>✓ {c}</li>)}
                </ul>
              </div>
            </div>

            <div className="promo-modal-footer">
              <button className="promo-modal-cancel" onClick={() => setModal(null)}>Hủy</button>
              <button className="promo-modal-confirm" onClick={handleConfirm}>
                Xác nhận & Chọn phòng →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoPage;
