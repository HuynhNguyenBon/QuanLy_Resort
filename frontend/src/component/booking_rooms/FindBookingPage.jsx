import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const FindBookingPage = () => {
  const { t } = useTranslation("findBooking");
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

  const STEPS = t("steps", { returnObjects: true });

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
        setError(t("errorPayment"));
      }
    } catch (err) {
      setError(err.response?.data?.message || t("errorPayment"));
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
      const res = await ApiService.getAllBookings();
      const allBookings = res.bookingList || [];
      const matched = allBookings.filter(
        (b) =>
          b.user?.email?.toLowerCase() === lookupEmail.trim().toLowerCase(),
      );
      if (matched.length === 0) {
        setLookupError(t("lookupError"));
      } else {
        setLookupResults(matched);
      }
    } catch {
      setLookupError(t("lookupErrorGeneral"));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSending(true);
    try {
      const subject = encodeURIComponent(
        `[BBHH Resort] Support - ${contactForm.name}`,
      );
      const body = encodeURIComponent(
        `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`,
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
      setError(t("errorEmpty"));
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
      setTimeout(
        () =>
          document
            .getElementById("fb-result")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? t("errorNotFound")
          : err.response?.data?.message || t("errorGeneral"),
      );
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
          <p className="fb-hero-tag">{t("heroTag")}</p>
          <h1 className="fb-hero-h1">
            {t("heroTitle1")} <span className="accent">{t("heroAccent")}</span>{" "}
            {t("heroTitle2")}
          </h1>
          <p className="fb-hero-sub">{t("heroSub")}</p>

          <div className="fb-search-box">
            <div className="fb-input-wrap">
              <span className="fb-input-icon">🎫</span>
              <input
                type="text"
                className="fb-input"
                placeholder={t("placeholder")}
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
              {loading ? t("searching") : t("searchBtn")}
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
              <div className="fb-confirmed-badge">✓ {t("confirmedBadge")}</div>
              <span className="fb-result-code">
                {t("codeLabel")}:{" "}
                <strong>{bookingDetails.bookingConfirmationCode}</strong>
              </span>
            </div>

            <div className="fb-result-grid">
              <div className="fb-room-img-wrap">
                <img
                  src={bookingDetails.room.roomPhotoUrl}
                  alt={bookingDetails.room.roomType}
                />
                <span className="fb-room-badge">
                  {bookingDetails.room.roomType}
                </span>
              </div>

              <div className="fb-result-info">
                <div className="fb-info-block">
                  <h3 className="fb-info-title">📅 {t("bookingInfo")}</h3>
                  <div className="fb-field">
                    <label>{t("confirmCode")}</label>
                    <span style={{ color: "var(--amber)", fontWeight: 700 }}>
                      {bookingDetails.bookingConfirmationCode}
                    </span>
                  </div>
                  <div className="fb-field">
                    <label>{t("checkIn")}</label>
                    <span className="fb-teal">
                      {bookingDetails.checkInDate}
                    </span>
                  </div>
                  <div className="fb-field">
                    <label>{t("checkOut")}</label>
                    <span className="fb-teal">
                      {bookingDetails.checkOutDate}
                    </span>
                  </div>
                  <div className="fb-field">
                    <label>{t("guestCount")}</label>
                    <span>
                      {bookingDetails.numOfAdults} {t("adults")}
                      {bookingDetails.numOfChildren > 0
                        ? ` · ${bookingDetails.numOfChildren} ${t("children")}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="fb-divider" />

                <div className="fb-info-block">
                  <h3 className="fb-info-title">👤 {t("guestInfo")}</h3>
                  <div className="fb-field">
                    <label>{t("fullName")}</label>
                    <span>{bookingDetails.user.name}</span>
                  </div>
                  <div className="fb-field">
                    <label>{t("email")}</label>
                    <span>{bookingDetails.user.email}</span>
                  </div>
                  <div className="fb-field">
                    <label>{t("phone")}</label>
                    <span>{bookingDetails.user.phoneNumber || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="fb-result-footer">🏨 {t("thankYou")}</div>

            <div className="fb-result-actions">
              {isPending(bookingDetails) ? (
                <>
                  <div className="fb-pay-banner">
                    <div className="fb-pay-banner-info">
                      <span>⏳</span>
                      <div>
                        <strong>{t("unpaidTitle")}</strong>
                        <p>{t("unpaidDesc")}</p>
                      </div>
                    </div>
                    <button
                      className="fb-pay-now-btn"
                      onClick={handlePayNow}
                      disabled={payLoading}
                    >
                      {payLoading ? t("processing") : `💳 ${t("payNow")}`}
                    </button>
                  </div>
                  <button
                    className="fb-action-btn ghost"
                    onClick={() => {
                      setBookingDetails(null);
                      setConfirmationCode("");
                    }}
                  >
                    🔍 {t("searchOther")}
                  </button>
                </>
              ) : (
                <>
                  <div className="fb-confirmed-banner">
                    <span>✅</span>
                    <div>
                      <strong>{t("confirmedTitle")}</strong>
                      <p>{t("confirmedDesc")}</p>
                    </div>
                  </div>
                  <div className="fb-action-row">
                    <button
                      className="fb-action-btn primary"
                      onClick={() => navigate("/profile")}
                    >
                      👤 {t("manageBooking")}
                    </button>
                    <button
                      className="fb-action-btn ghost"
                      onClick={() => {
                        setBookingDetails(null);
                        setConfirmationCode("");
                      }}
                    >
                      🔍 {t("searchOther")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── HƯỚNG DẪN ── */}
      {!bookingDetails && (
        <div className="fb-guide-section">
          <div className="fb-guide-inner">
            <div className="fb-guide-steps">
              <h2 className="fb-guide-title">{t("guideTitle")}</h2>
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

              {showEmailLookup && (
                <div className="fb-email-lookup">
                  <h4 className="fb-lookup-title">
                    📧 {t("emailLookupTitle")}
                  </h4>
                  <p className="fb-lookup-sub">{t("emailLookupSub")}</p>
                  <form onSubmit={handleEmailLookup} className="fb-lookup-form">
                    <input
                      type="email"
                      className="fb-lookup-input"
                      placeholder={t("emailPlaceholder")}
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="fb-lookup-btn"
                      disabled={lookupLoading}
                    >
                      {lookupLoading
                        ? t("lookupSearching")
                        : `🔍 ${t("lookupBtn")}`}
                    </button>
                  </form>
                  {lookupError && (
                    <p className="fb-lookup-error">⚠️ {lookupError}</p>
                  )}
                  {lookupResults.length > 0 && (
                    <div className="fb-lookup-results">
                      <p className="fb-lookup-found">
                        {t("lookupFound", { count: lookupResults.length })}
                      </p>
                      {lookupResults.map((b) => (
                        <div
                          key={b.id}
                          className="fb-lookup-item"
                          onClick={() => {
                            setConfirmationCode(b.bookingConfirmationCode);
                            setShowEmailLookup(false);
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

            <div className="fb-support-box">
              <div className="fb-support-header">
                <div className="fb-support-icon">💬</div>
                <div className="fb-support-title-wrap">
                  <h3>{t("supportTitle")}</h3>
                  <p>{t("supportDesc")}</p>
                </div>
                <a href="tel:0909448608" className="fb-hotline-btn">
                  📞 {t("hotline")}
                </a>
              </div>

              <div className="fb-support-divider">
                <span>{t("orSend")}</span>
              </div>

              {contactSuccess ? (
                <div className="fb-support-success">
                  <span>✅</span>
                  <div>
                    <strong>{t("successEmail")}</strong>
                    <p>{t("successEmailDesc")}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContact} className="fb-support-form">
                  <div className="fb-support-row">
                    <div className="fb-support-field">
                      <label>{t("nameLabel")}</label>
                      <input
                        type="text"
                        placeholder={t("namePlaceholder")}
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
                      <label>{t("yourEmail")}</label>
                      <input
                        type="email"
                        placeholder={t("emailPlaceholder")}
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
                    <label>{t("issueDesc")}</label>
                    <textarea
                      placeholder={t("issuePlaceholder")}
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
                    {contactSending ? t("sending") : `📧 ${t("sendSupport")}`}
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
