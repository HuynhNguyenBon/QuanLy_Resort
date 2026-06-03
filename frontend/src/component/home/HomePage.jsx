import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";
import { useTranslation } from "react-i18next";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import "../../UiverseElements.css";

const ROOM_TYPES = [
  { type: "Standard", price: "50", emoji: "🛏️", bg: "#F8FAFC" },
  { type: "Superior", price: "80", emoji: "🌟", bg: "#FFFBEB" },
  { type: "Deluxe", price: "120", emoji: "👑", bg: "#ECFDF5" },
  { type: "Suite", price: "200", emoji: "💎", bg: "#EFF6FF" },
  { type: "Family", price: "150", emoji: "👨‍👩‍👧", bg: "#FDF4FF" },
];

const SERVICES = [
  { key: "pool", descKey: "poolDesc", icon: "🏊" },
  { key: "miniBar", descKey: "miniBarDesc", icon: "🍽️" },
  { key: "parking", descKey: "parkingDesc", icon: "🚗" },
  { key: "spa", descKey: "spaDesc", icon: "💆" },
];

const TESTIMONIALS = [
  {
    nameKey: "testimonialName1",
    city: "Hanoi",
    rating: 5,
    textKey: "testimonial1",
    avatar: "MA",
    color: "#3B82F6",
  },
  {
    nameKey: "testimonialName2",
    city: "HCMC",
    rating: 5,
    textKey: "testimonial2",
    avatar: "VK",
    color: "#10B981",
  },
  {
    nameKey: "testimonialName3",
    city: "Danang",
    rating: 4,
    textKey: "testimonial3",
    avatar: "TH",
    color: "#F59E0B",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("home");
  const [roomSearchResults, setRoomSearchResults] = useState([]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hp-hero">
        <img
          src="./assets/images/hotel.webp"
          alt="BBHH Resort"
          className="hp-hero-bg"
          fetchpriority="high"
          decoding="async"
        />
        <div className="hp-hero-overlay" />
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
            <button
              className="btn-ghost-dark"
              onClick={() => navigate("/services")}
            >
              {t("heroServices")} <span>→</span>
            </button>
          </div>
        </div>
        <div className="hp-hero-stats">
          {[
            ["500+", t("stats_rooms")],
            ["98%", t("stats_satisfaction")],
            ["15+", t("stats_years")],
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

      {/* ── KẾT QUẢ ── */}
      {roomSearchResults.length > 0 && (
        <section className="hp-section hp-section-alt">
          <div className="hp-results-wrap">
            <div className="hp-results-header">
              <div>
                <h2 className="hp-results-h2">
                  {t("searchResultTitle")}{" "}
                  <span>{roomSearchResults.length}</span>{" "}
                  {t("searchResultTitle1")}
                </h2>
              </div>
              <button
                className="btn-clear"
                onClick={() => setRoomSearchResults([])}
              >
                ✕ {t("clearResults")}
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
              <p className="hp-section-tag">{t("roomsTag")}</p>
              <h2 className="hp-section-h2">{t("roomsTitle")}</h2>
              <p className="hp-section-sub">{t("roomsSubtitle")}</p>
            </div>
            <button className="btn-navy" onClick={() => navigate("/rooms")}>
              {t("viewAll")} <span>→</span>
            </button>
          </div>
          <div className="hp-room-grid">
            {ROOM_TYPES.map((r) => (
              <div
                key={r.type}
                className="hp-room-card"
                onClick={() => navigate("/rooms")}
              >
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
      <section className="hp-section hp-section-alt">
        <div className="hp-section-inner">
          <p className="hp-section-tag">{t("servicesTag")}</p>
          <h2 className="hp-section-h2">
            {t("servicesTag")} <span className="accent">BBHH Resort</span>
          </h2>
          <p className="hp-section-sub" style={{ marginBottom: "32px" }}>
            {t("servicesSubtitle")}
          </p>
          <div className="hp-svc-grid">
            {SERVICES.map((s) => (
              <div
                key={s.key}
                className="hp-svc-card"
                onClick={() => navigate("/services")}
              >
                <div className="hp-svc-icon-wrap">
                  <span className="hp-svc-icon">{s.icon}</span>
                </div>
                <div className="hp-svc-title">{t(s.key)}</div>
                <div className="hp-svc-desc">{t(s.descKey)}</div>
                <div className="hp-svc-link">
                  {t("viewDetail")} <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ĐÁNH GIÁ ── */}
      <section className="hp-section hp-section-center">
        <div className="hp-section-inner">
          <p className="hp-section-tag">{t("testimonials.tag")}</p>
          <h2 className="hp-section-h2" style={{ marginBottom: "36px" }}>
            {t("testimonials.titlePrefix")}{" "}
            <span className="accent">10,000</span>{" "}
            {t("testimonials.titleSuffix")}
          </h2>
          <div className="hp-testi-grid">
            {TESTIMONIALS.map((r) => (
              <div key={r.name} className="hp-testi-card">
                <div className="hp-testi-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p className="hp-testi-text">
                  "{t(`testimonials.${r.textKey}`)}"
                </p>

                <div className="hp-testi-author">
                  <div
                    className="hp-testi-avatar"
                    style={{ background: r.color }}
                  >
                    {r.avatar}
                  </div>

                  <div>
                    <div className="hp-testi-name">
                      {t(`testimonials.${r.nameKey}`)}
                    </div>

                    <div className="hp-testi-city">
                      📍 {t(`cities.${r.city}`)}
                    </div>
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
          <h2 className="hp-cta-h2">{t("cta.title")}</h2>
          <p className="hp-cta-sub">{t("cta.subtitle")}</p>
          <div className="hp-cta-btns">
            <button className="btn-gold" onClick={() => navigate("/rooms")}>
              {t("cta.bookNow")}
            </button>
            <button
              className="btn-ghost-dark"
              onClick={() => navigate("/find-booking")}
            >
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
