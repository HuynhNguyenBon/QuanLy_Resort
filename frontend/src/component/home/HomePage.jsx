import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";
import { useTranslation } from "react-i18next";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import "../../UiverseElements.css";

// type = key dịch i18n để hiển thị, backendType = giá trị thực trong database
const ROOM_TYPES = [
  { type: "Standard", backendType: "Standrad",    price: "50",  emoji: "🛏️" },
  { type: "Superior", backendType: "Studio",       price: "80",  emoji: "🌟" },
  { type: "Deluxe",   backendType: "Precidential", price: "120", emoji: "👑" },
  { type: "Suite",    backendType: "Suit",          price: "200", emoji: "💎" },
  { type: "Family",   backendType: "Family",        price: "150", emoji: "👨‍👩‍👧" },
];

const SERVICES = [
  { key: "pool",    descKey: "poolDesc",    icon: "🏊", path: "/services?highlight=pool" },
  { key: "miniBar", descKey: "miniBarDesc", icon: "🍽️", path: "/services?highlight=miniBar" },
  { key: "gym",     descKey: "gymDesc",     icon: "🏋️", path: "/services?highlight=gym" },
  { key: "spa",     descKey: "spaDesc",     icon: "💆", path: "/services?highlight=spa" },
];

const TESTIMONIALS = [
  { nameKey: "testimonialName1", city: "Hanoi",  rating: 5, textKey: "testimonial1", avatar: "MA", color: "#3B82F6" },
  { nameKey: "testimonialName2", city: "HCMC",   rating: 5, textKey: "testimonial2", avatar: "VK", color: "#10B981" },
  { nameKey: "testimonialName3", city: "Danang", rating: 4, textKey: "testimonial3", avatar: "TH", color: "#F59E0B" },
];

const PROMOS = [
  { icon: "🌙", badge: "HOT", titleKey: "promoEarly", descKey: "promoEarlyDesc", discount: "20%", color: "#0F3460", path: "/rooms" },
  { icon: "👨‍👩‍👧", badge: "NEW", titleKey: "promoFamily", descKey: "promoFamilyDesc", discount: "15%", color: "#0F3460", path: "/rooms?type=Family" },
  { icon: "💆", badge: "DEAL", titleKey: "promoSpa", descKey: "promoSpaDesc", discount: "FREE", color: "#0F3460", path: "/services?highlight=spa" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("home");
  const [roomSearchResults, setRoomSearchResults] = useState([]);
  const [weather, setWeather] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bbhh_wishlist") || "[]"); }
    catch { return []; }
  });

  // Lấy thời tiết thực tế (Open-Meteo - miễn phí, không cần API key)
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=10.7769&longitude=106.7009&current=temperature_2m,weathercode,windspeed_10m&timezone=Asia/Bangkok")
      .then(r => r.json())
      .then(data => {
        const code = data.current.weathercode;
        const temp = Math.round(data.current.temperature_2m);
        const wind = Math.round(data.current.windspeed_10m);
        const icons = {
          0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
          45: "🌫️", 48: "🌫️",
          51: "🌦️", 53: "🌦️", 55: "🌧️",
          61: "🌧️", 63: "🌧️", 65: "🌧️",
          80: "🌦️", 81: "🌧️", 82: "⛈️",
          95: "⛈️", 96: "⛈️", 99: "⛈️",
        };
        setWeather({ temp, wind, icon: icons[code] || "🌤️" });
      })
      .catch(() => setWeather({ temp: 28, wind: 15, icon: "☀️" }));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hp-hero">
        <img src="./assets/images/hotel.webp" alt="BBHH Resort"
          className="hp-hero-bg" fetchpriority="high" decoding="async"
          onError={e => e.target.style.display = "none"} />
        <div className="hp-hero-overlay" />

        {/* Weather badge */}
        {weather && (
          <div className="hp-weather-badge">
            <span className="hp-weather-icon">{weather.icon}</span>
            <div>
              <div className="hp-weather-temp">{weather.temp}°C</div>
              <div className="hp-weather-loc">TP. Hồ Chí Minh</div>
            </div>
          </div>
        )}

        <div className="hp-hero-content">
          <div className="hp-hero-badge">{t("heroBadge")}</div>
          <h1 className="hp-hero-h1">
            {t("heroTitle1")} <br />
            <span className="accent">{t("heroTitle2")}</span> {t("heroTitle3")}
          </h1>
          <p className="hp-hero-sub">{t("subtitle")}</p>
          <div className="hp-hero-btns">
            <button className="btn-gold" onClick={() => navigate("/rooms")}>
              {t("heroSubtitle")}
            </button>
            <button className="btn-ghost-dark" onClick={() => navigate("/services")}>
              {t("heroServices")} <span>→</span>
            </button>
          </div>
        </div>
        <div className="hp-hero-stats">
          {[
            ["500+", t("stats_rooms")],
            ["98%",  t("stats_satisfaction")],
            ["15+",  t("stats_years")],
            ["24/7", t("stats_support")],
          ].map(([n, l]) => (
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

      {/* ── KẾT QUẢ TÌM KIẾM ── */}
      {roomSearchResults.length > 0 && (
        <section className="hp-section hp-section-alt">
          <div className="hp-results-wrap">
            <div className="hp-results-header">
              <div>
                <h2 className="hp-results-h2">
                  {t("searchResultTitle")} <span>{roomSearchResults.length}</span> {t("searchResultTitle1")}
                </h2>
              </div>
              <button className="btn-clear" onClick={() => setRoomSearchResults([])}>
                ✕ {t("clearResults")}
              </button>
            </div>
            <RoomResult roomSearchResults={roomSearchResults} />
          </div>
        </section>
      )}

      {/* ── ƯU ĐÃI ĐẶC BIỆT ── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div>
              <p className="hp-section-tag">🏷️ ƯU ĐÃI ĐẶC BIỆT</p>
              <h2 className="hp-section-h2">Khuyến mãi dành cho bạn</h2>
              <p className="hp-section-sub">Đặt sớm, tiết kiệm nhiều hơn</p>
            </div>
          </div>
          <div className="hp-promo-grid">
            {PROMOS.map((p, i) => (
              <div key={i} className="hp-promo-card" onClick={() => navigate(p.path)}>
                <div className="hp-promo-badge">{p.badge}</div>
                <div className="hp-promo-icon">{p.icon}</div>
                <div className="hp-promo-discount">{p.discount}</div>
                <h3 className="hp-promo-title">{t(p.titleKey)}</h3>
                <p className="hp-promo-desc">{t(p.descKey)}</p>
                <button className="hp-promo-btn">Đặt ngay →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHÒNG NGHỈ ── */}
      <section className="hp-section hp-section-alt">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <div>
              <p className="hp-section-tag">{t("roomsTag")}</p>
              <h2 className="hp-section-h2">{t("roomsTitle")}</h2>
              <p className="hp-section-sub">{t("roomsSubtitle")}</p>
            </div>
            <button className="btn-navy" onClick={() => navigate("/rooms")}>
              {t("viewAll")} <span>→</span>
            </button>
          </div>
          <div className="hp-room-grid">
            {ROOM_TYPES.map(r => (
              <div key={r.type} className="hp-room-card" onClick={() => navigate(`/rooms?type=${r.backendType}`)}>
                <span className="hp-room-emoji">{r.emoji}</span>
                <div className="hp-room-type">{t(`roomTypes.${r.type}`)}</div>
                <div className="hp-room-price">
                  {formatPrice(r.price, i18n.language)} / {t("perNight")}
                </div>
                <div className="hp-room-arrow">{t("viewRoom")} →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DỊCH VỤ ── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <p className="hp-section-tag">{t("servicesTag")}</p>
          <h2 className="hp-section-h2">
            {t("servicesTag")} <span className="accent">BBHH Resort</span>
          </h2>
          <p className="hp-section-sub" style={{ marginBottom: "32px" }}>
            {t("servicesSubtitle")}
          </p>
          <div className="hp-svc-grid">
            {SERVICES.map(s => (
              <div key={s.key} className="hp-svc-card" onClick={() => navigate(s.path)}>
                <div className="hp-svc-icon-wrap">
                  <span className="hp-svc-icon">{s.icon}</span>
                </div>
                <div className="hp-svc-title">{t(s.key)}</div>
                <div className="hp-svc-desc">{t(s.descKey)}</div>
                <div className="hp-svc-link">{t("viewDetail")} <span>→</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ĐÁNH GIÁ ── */}
      <section className="hp-section hp-section-center hp-section-alt">
        <div className="hp-section-inner">
          <p className="hp-section-tag">{t("testimonials.tag")}</p>
          <h2 className="hp-section-h2" style={{ marginBottom: "36px" }}>
            {t("testimonials.titlePrefix")} <span className="accent">10,000</span> {t("testimonials.titleSuffix")}
          </h2>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map(r => (
              <div key={r.nameKey} className="hp-testi-card">
                <div className="hp-testi-stars">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <p className="hp-testi-text">"{t(`testimonials.${r.textKey}`)}"</p>
                <div className="hp-testi-author">
                  <div className="hp-testi-avatar" style={{ background: r.color }}>{r.avatar}</div>
                  <div>
                    <div className="hp-testi-name">{t(`testimonials.${r.nameKey}`)}</div>
                    <div className="hp-testi-city">📍 {t(`cities.${r.city}`)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIỆN ÍCH RESORT ── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <p className="hp-section-tag">🏖️ TIỆN ÍCH RESORT</p>
          <h2 className="hp-section-h2">Mọi thứ bạn cần trong một kỳ nghỉ</h2>
          <div className="hp-amenity-grid">
            {[
              { icon: "🏊", label: "Hồ bơi vô cực",    desc: "Mở 6:00–22:00" },
              { icon: "🍽️", label: "5 nhà hàng",        desc: "Ẩm thực đa dạng" },
              { icon: "💆", label: "Spa & Wellness",    desc: "Thư giãn toàn diện" },
              { icon: "🏋️", label: "Gym & Yoga",        desc: "Thiết bị hiện đại" },
              { icon: "🎾", label: "Sân tennis",         desc: "4 sân tiêu chuẩn" },
              { icon: "🚗", label: "Đưa đón sân bay",   desc: "24/7 xe sang" },
              { icon: "🏖️", label: "Bãi biển riêng",    desc: "500m bờ biển" },
              { icon: "👶", label: "Club trẻ em",        desc: "Vui chơi an toàn" },
            ].map((a, i) => (
              <div key={i} className="hp-amenity-item">
                <span className="hp-amenity-icon">{a.icon}</span>
                <div className="hp-amenity-label">{a.label}</div>
                <div className="hp-amenity-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hp-section hp-section-alt">
        <div className="hp-cta-box">
          <h2 className="hp-cta-h2">{t("cta.title")}</h2>
          <p className="hp-cta-sub">{t("cta.subtitle")}</p>
          <div className="hp-cta-btns">
            <button className="btn-gold" onClick={() => navigate("/rooms")}>
              {t("cta.bookNow")}
            </button>
            <button className="btn-ghost-dark" onClick={() => navigate("/find-booking")}>
              {t("cta.findBooking")}
            </button>
          </div>
          <p className="hp-cta-note">{t("cta.note")}</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;