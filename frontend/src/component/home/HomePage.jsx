import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import "../../UiverseElements.css";

const ROOM_TYPES = [
  { type: "Standard", price: "Từ 50$/đêm", emoji: "🛏️", bg: "#F8FAFC" },
  { type: "Superior", price: "Từ 80$/đêm", emoji: "🌟", bg: "#FFFBEB" },
  { type: "Deluxe",   price: "Từ 120$/đêm",emoji: "👑", bg: "#ECFDF5" },
  { type: "Suite",    price: "Từ 200$/đêm",emoji: "💎", bg: "#EFF6FF" },
  { type: "Family",   price: "Từ 150$/đêm",emoji: "👨‍👩‍👧", bg: "#FDF4FF" },
];

const SERVICES = [
  { key: "pool",    descKey: "poolDesc",    icon: "🏊" },
  { key: "miniBar", descKey: "miniBarDesc", icon: "🍽️" },
  { key: "parking", descKey: "parkingDesc", icon: "🚗" },
  { key: "spa",     descKey: "spaDesc",     icon: "💆" },
];

const TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", city: "Hà Nội",  rating: 5, text: "Dịch vụ tuyệt vời, phòng rộng rãi và sạch sẽ. chúng tôi sẽ quay lại.", avatar: "MA", color: "#3B82F6" },
  { name: "Trần Văn Khoa",   city: "TP.HCM",  rating: 5, text: "Hồ bơi vô cực đẹp, view biển tuyệt hảo. Nhà hàng ngon và đa dạng món ăn.",                        avatar: "VK", color: "#10B981" },
  { name: "Lê Thu Hương",    city: "Đà Nẵng", rating: 4, text: "Không gian yên tĩnh, nghỉ ngơi rất thoải mái. Spa rất chuyên nghiệp, thư giãn cực kỳ.",            avatar: "TH", color: "#F59E0B" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("home");
  const [roomSearchResults, setRoomSearchResults] = useState([]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hp-hero">
        <img src="./assets/images/hotel.webp" alt="BBHH Resort" className="hp-hero-bg" />
        <div className="hp-hero-overlay" />
        <div className="hp-hero-content">
          <div className="hp-hero-badge">★ RESORT &amp; SPA — VIỆT NAM</div>
          <h1 className="hp-hero-h1">
            Nơi nghỉ dưỡng<br />
            <span className="accent">đẳng cấp</span> của bạn
          </h1>
          <p className="hp-hero-sub">{t("subtitle")}</p>
          <div className="hp-hero-btns">
            <button className="btn-gold" onClick={() => navigate("/rooms")}>
              🛏️ Đặt phòng ngay
            </button>
            <button className="btn-ghost-dark" onClick={() => navigate("/services")}>
              Xem dịch vụ
            </button>
          </div>
        </div>
        <div className="hp-hero-stats">
          {[["500+","Phòng nghỉ"],["98%","Hài lòng"],["15+","Năm KN"],["24/7","Hỗ trợ"]].map(([n,l]) => (
            <div key={l}>
              <div className="hp-stat-num">{n}</div>
              <div className="hp-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEARCH ── */}
      <div className="hp-search-wrap">
        <RoomSearch handleSearchResult={setRoomSearchResults} />
      </div>

      {/* ── KẾT QUẢ ── */}
      {roomSearchResults.length > 0 && (
        <section className="hp-section hp-section-alt">
          <div className="hp-results-wrap">
            <div className="hp-results-header">
              <div>
                <h2 className="hp-results-h2">
                  Tìm thấy <span>{roomSearchResults.length}</span> phòng còn trống
                </h2>
              </div>
              <button className="btn-clear" onClick={() => setRoomSearchResults([])}>
                ✕ Xoá kết quả
              </button>
            </div>
            <RoomResult roomSearchResults={roomSearchResults} />
          </div>
        </section>
      )}

      {/* ── PHÒNG NGHỈ ── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div>
              <p className="hp-section-tag">PHÒNG NGHỈ</p>
              <h2 className="hp-section-h2">Chọn phòng phù hợp với bạn</h2>
              <p className="hp-section-sub">Từ phòng tiêu chuẩn đến suite cao cấp — đầy đủ tiện nghi cho mọi nhu cầu.</p>
            </div>
            <button className="btn-navy" onClick={() => navigate("/rooms")}>
              Xem tất cả →
            </button>
          </div>
          <div className="hp-room-grid">
            {ROOM_TYPES.map(r => (
              <div
                key={r.type}
                className="hp-room-card"
                onClick={() => navigate("/rooms")}
              >
                <span className="hp-room-emoji">{r.emoji}</span>
                <div className="hp-room-type">{r.type}</div>
                <div className="hp-room-price">{r.price}</div>
                <div className="hp-room-arrow">Xem phòng →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DỊCH VỤ ── */}
      <section className="hp-section hp-section-alt">
        <div className="hp-section-inner">
          <p className="hp-section-tag">DỊCH VỤ</p>
          <h2 className="hp-section-h2">
            {t("servicesTitle")} <span className="accent">BBHH Resort</span>
          </h2>
          <p className="hp-section-sub" style={{ marginBottom: "32px" }}>
            Tiện nghi hiện đại, dịch vụ chu đáo — được thiết kế để kỳ nghỉ thật sự trọn vẹn.
          </p>
          <div className="hp-svc-grid">
            {SERVICES.map(s => (
              <div key={s.key} className="hp-svc-card" onClick={() => navigate("/services")}>
                <div className="hp-svc-icon-wrap">
                  <span className="hp-svc-icon">{s.icon}</span>
                </div>
                <div className="hp-svc-title">{t(s.key)}</div>
                <div className="hp-svc-desc">{t(s.descKey)}</div>
                <div className="hp-svc-link">Xem chi tiết <span>→</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ĐÁNH GIÁ ── */}
      <section className="hp-section hp-section-center">
        <div className="hp-section-inner">
          <p className="hp-section-tag">ĐÁNH GIÁ KHÁCH HÀNG</p>
          <h2 className="hp-section-h2" style={{ marginBottom: "36px" }}>
            Hơn <span className="accent">10,000</span> lượt nghỉ hài lòng
          </h2>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map(r => (
              <div key={r.name} className="hp-testi-card">
                <div className="hp-testi-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p className="hp-testi-text">"{r.text}"</p>
                <div className="hp-testi-author">
                  <div className="hp-testi-avatar" style={{ background: r.color }}>{r.avatar}</div>
                  <div>
                    <div className="hp-testi-name">{r.name}</div>
                    <div className="hp-testi-city">📍 {r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hp-section hp-section-alt">
        <div className="hp-cta-box">
          <h2 className="hp-cta-h2">Sẵn sàng cho kỳ nghỉ của bạn?</h2>
          <p className="hp-cta-sub">Đặt phòng ngay — xác nhận tức thì, hủy miễn phí trước 24h.</p>
          <div className="hp-cta-btns">
            <button className="btn-gold" onClick={() => navigate("/rooms")}>
              🛏️ Đặt phòng ngay
            </button>
            <button className="btn-ghost-dark" onClick={() => navigate("/find-booking")}>
              🔍 Tra cứu đặt phòng
            </button>
          </div>
          <p className="hp-cta-note">✓ Hủy miễn phí trước 24h &nbsp;·&nbsp; ✓ Xác nhận tức thì &nbsp;·&nbsp; ✓ Hỗ trợ 24/7</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
