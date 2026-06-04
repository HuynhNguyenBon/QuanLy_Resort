import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../UiverseElements.css";

const today = () => new Date().toISOString().split("T")[0];

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const PROMO_META = [
  { id: "early_bird", badge: "HOT", icon: "🌙", discount: "20%", preferredType: null,        minDaysAdvance: 30, minNights: 1, path: "/rooms" },
  { id: "family",     badge: "NEW", icon: "👨‍👩‍👧", discount: "15%", preferredType: "Family",    minDaysAdvance: 0,  minNights: 1, path: "/rooms?type=Family" },
  { id: "spa",        badge: "DEAL",icon: "💆", discount: "FREE",preferredType: "Precidential",minDaysAdvance: 0,  minNights: 1, path: "/rooms" },
  { id: "weekend",    badge: "NEW", icon: "🌊", discount: "10%", preferredType: null,        minDaysAdvance: 7,  minNights: 2, path: "/rooms", weekendOnly: true },
  { id: "honeymoon",  badge: "HOT", icon: "💑", discount: "25%", preferredType: "Suit",      minDaysAdvance: 0,  minNights: 2, path: "/rooms?type=Suit" },
  { id: "gym",        badge: "DEAL",icon: "🏋️", discount: "FREE",preferredType: null,        minDaysAdvance: 0,  minNights: 3, path: "/rooms" },
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
  const daysUntilFriday = (5 - d.getDay() + 7) % 7 || 7;
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
  const { t } = useTranslation("promo");
  const [modal, setModal] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  // Merge meta + i18n translations
  const PROMOS = PROMO_META.map(p => ({
    ...p,
    title:      t(`promos.${p.id}.title`),
    desc:       t(`promos.${p.id}.desc`),
    conditions: t(`promos.${p.id}.conditions`, { returnObjects: true }),
    hint:       t(`promos.${p.id}.hint`),
  }));

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
    if (!checkIn)  return t("validation.selectCheckin");
    if (!checkOut) return t("validation.selectCheckout");
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (ci <= now) return t("validation.selectCheckin");
    if (co <= ci)  return t("validation.checkoutAfter");
    const nights = getNights(checkIn, checkOut);
    if (nights < modal.minNights)
      return t("validation.minNights", { n: modal.minNights });
    if (modal.minDaysAdvance > 0) {
      const daysAhead = Math.floor((ci - now) / 86400000);
      if (daysAhead < modal.minDaysAdvance)
        return t("validation.minDays", { n: modal.minDaysAdvance });
    }
    if (modal.weekendOnly) {
      if (ci.getDay() !== 5) return t("validation.weekendOnly");
      if (co.getDay() !== 0) return t("validation.checkoutSunday");
    }
    return null;
  };

  const handleConfirm = () => {
    const err = validate();
    if (err) { setError(err); return; }
    sessionStorage.setItem("bbhh_active_promo", JSON.stringify({
      id: modal.id, title: modal.title, discount: modal.discount,
      checkIn, checkOut, nights: getNights(checkIn, checkOut),
    }));
    setModal(null);
    navigate(modal.path);
  };

  const nights = getNights(checkIn, checkOut);

  return (
    <div className="promo-page">
      <div className="promo-hero">
        <div className="promo-hero-inner">
          <p className="promo-hero-tag">{t("heroTag")}</p>
          <h1 className="promo-hero-h1">
            {t("heroTitle1")} <span className="accent">{t("heroAccent")}</span> {t("heroTitle2")}
          </h1>
          <p className="promo-hero-sub">{t("heroSub")}</p>
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
                      {t("bookBtn")}
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
              <div className="promo-modal-hint">{t("hintLabel")} {modal.hint}</div>
            )}

            <div className="promo-modal-body">
              <div className="promo-modal-row">
                <div className="promo-modal-field">
                  <label>{t("checkIn")} *</label>
                  <input type="date" value={checkIn}
                    min={modal.minDaysAdvance > 0 ? addDays(modal.minDaysAdvance) : addDays(1)}
                    onChange={e => {
                      setCheckIn(e.target.value); setError("");
                      if (modal.weekendOnly) setCheckOut(getSundayAfter(e.target.value));
                    }} />
                </div>
                <div className="promo-modal-field">
                  <label>{t("checkOut")} *</label>
                  <input type="date" value={checkOut}
                    min={checkIn || addDays(2)}
                    readOnly={modal.weekendOnly}
                    onChange={e => { setCheckOut(e.target.value); setError(""); }}
                    style={modal.weekendOnly ? { opacity: 0.6, cursor: "not-allowed" } : {}} />
                </div>
              </div>

              {nights > 0 && (
                <div className="promo-modal-nights">
                  🌙 {nights} {nights === 1 ? t("checkIn") : t("checkIn")}
                  {nights >= modal.minNights
                    ? <span className="promo-nights-ok"> · ✓</span>
                    : <span className="promo-nights-fail"> · {t("validation.minNights", { n: modal.minNights })}</span>}
                </div>
              )}

              {error && <div className="promo-modal-error">⚠️ {error}</div>}

              <div className="promo-modal-conditions">
                <div className="promo-modal-conditions-title">{t("conditionsLabel")}</div>
                <ul>
                  {modal.conditions.map((c, i) => <li key={i}>✓ {c}</li>)}
                </ul>
              </div>
            </div>

            <div className="promo-modal-footer">
              <button className="promo-modal-cancel" onClick={() => setModal(null)}>{t("cancel")}</button>
              <button className="promo-modal-confirm" onClick={handleConfirm}>
                {t("applyPromo")} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoPage;
