import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { getRoomTranslation } from "../../data/roomTranslations";

const EXCHANGE_RATES = { vi: 25000, ja: 155, en: 1 };
const formatPrice = (amountUSD, lang) => {
  const code = (lang || "en").split("-")[0];
  if (code === "vi")
    return `${Math.round(amountUSD * EXCHANGE_RATES.vi).toLocaleString("vi-VN")} VNĐ`;
  if (code === "ja")
    return `¥${Math.round(amountUSD * EXCHANGE_RATES.ja).toLocaleString("ja-JP")}`;
  return `$${amountUSD}`;
};

const EditBookingPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const navigate = useNavigate();
  const lang = i18n.language.split("-")[0];
  const { bookingCode } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fmtDate = (d) => {
    if (!d) return "—";
    const locale = i18n.language.startsWith("ja")
      ? "ja-JP"
      : i18n.language.startsWith("en")
        ? "en-US"
        : "vi-VN";
    return new Date(d).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (b) => {
    if (!b) return null;
    const p = (b.paymentStatus || "").toUpperCase();
    if (p === "PAID")
      return {
        label: t("editBooking.statusPaid"),
        bg: "#f0fdf4",
        color: "#15803d",
        border: "#bbf7d0",
        dot: "#22c55e",
      };
    const s = (b.bookingStatus || "").toLowerCase();
    if (s === "confirmed" || s === "true")
      return {
        label: t("editBooking.statusConfirmed"),
        bg: "#f0fdf4",
        color: "#15803d",
        border: "#bbf7d0",
        dot: "#22c55e",
      };
    if (s === "cancelled" || s === "canceled")
      return {
        label: t("editBooking.statusCancelled"),
        bg: "#fef2f2",
        color: "#b91c1c",
        border: "#fecaca",
        dot: "#ef4444",
      };
    return {
      label: t("editBooking.statusPending"),
      bg: "#fffbeb",
      color: "#b45309",
      border: "#fde68a",
      dot: "#f59e0b",
    };
  };

  const Field = ({ label, value, accent }) => (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: accent ? 700 : 500,
          color: accent ? "#0d9488" : "#1a1a2e",
          padding: "9px 13px",
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #e8ecef",
        }}
      >
        {value ?? "—"}
      </div>
    </div>
  );

  useEffect(() => {
    ApiService.getBookingByConfirmationCode(bookingCode)
      .then((r) => setBooking(r.booking))
      .catch((e) => setError(e.message));
  }, [bookingCode]);

  const handleCancel = async () => {
    if (!window.confirm(t("editBooking.confirmCancel"))) return;
    setCancelling(true);
    try {
      const res = await ApiService.cancelBooking(booking.id);
      if (res.statusCode === 200) {
        setSuccess(t("editBooking.cancelSuccess"));
        const dest = ApiService.isAdmin()
          ? "/admin/manage-bookings"
          : "/staff/bookings";
        setTimeout(() => navigate(dest), 2500);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setCancelling(false);
    }
  };

  const sc = booking ? getStatusConfig(booking) : null;
  const nights = booking
    ? Math.max(
        1,
        Math.round(
          (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
            86400000,
        ),
      )
    : 0;

  const handleBack = () => navigate(-1);

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            {t("editBooking.title")}{" "}
            <code
              style={{
                background: "#f0fdfa",
                color: "#0d9488",
                padding: "2px 10px",
                borderRadius: 6,
                fontSize: "1rem",
                border: "1px solid #ccfbf1",
              }}
            >
              {bookingCode}
            </code>
          </h2>
        </div>
        {sc && (
          <span
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: "0.82rem",
              fontWeight: 700,
              background: sc.bg,
              color: sc.color,
              border: `1.5px solid ${sc.border}`,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: sc.dot,
              }}
            />
            {sc.label}
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontSize: "0.88rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            background: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            fontSize: "0.88rem",
          }}
        >
          ✓ {success}
        </div>
      )}

      {booking && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e8ecef",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
              padding: "18px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>📋</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                {(booking.room?.roomType
                  ? getRoomTranslation(booking.room.roomType, lang)?.roomType ||
                    booking.room.roomType
                  : null) || t("editBooking.title")}
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem" }}
              >
                {fmtDate(booking.checkInDate)} → {fmtDate(booking.checkOutDate)}{" "}
                · {nights} {t("editBooking.stayNights")}
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div
                style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem" }}
              >
                {booking.totalPrice != null
                  ? formatPrice(booking.totalPrice, lang)
                  : booking.room?.roomPrice
                    ? formatPrice(booking.room.roomPrice * nights, lang)
                    : "—"}
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem" }}
              >
                {t("editBooking.totalLabel")}
              </div>
            </div>
          </div>

          {/* Body: 3 columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr 1fr",
              borderTop: "1px solid #f0f2f5",
            }}
          >
            {/* Room image */}
            <div
              style={{
                borderRight: "1px solid #f0f2f5",
                padding: 20,
                background: "#fafbfd",
              }}
            >
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #e8ecef",
                  aspectRatio: "4/3",
                  background: "#f0f2f5",
                }}
              >
                {booking.room?.roomPhotoUrl ? (
                  <img
                    src={booking.room.roomPhotoUrl}
                    alt="Room"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#bbb",
                      fontSize: "2rem",
                    }}
                  >
                    🛏️
                  </div>
                )}
              </div>
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                    marginBottom: 4,
                  }}
                >
                  {booking.room?.roomType
                    ? getRoomTranslation(booking.room.roomType, lang)
                        ?.roomType || booking.room.roomType
                    : "—"}
                </div>
                <div style={{ color: "#0d9488", fontWeight: 700 }}>
                  {booking.room?.roomPrice != null
                    ? formatPrice(booking.room.roomPrice, lang)
                    : "—"}
                  <span
                    style={{
                      color: "#94a3b8",
                      fontWeight: 400,
                      fontSize: "0.82rem",
                    }}
                  >
                    {t("editBooking.perNight")}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking details */}
            <div style={{ padding: 24, borderRight: "1px solid #f0f2f5" }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#0d9488",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                📅 {t("editBooking.bookingInfo")}
              </div>
              <Field
                label={t("editBooking.checkIn")}
                value={fmtDate(booking.checkInDate)}
              />
              <Field
                label={t("editBooking.checkOut")}
                value={fmtDate(booking.checkOutDate)}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field
                  label={t("editBooking.adults")}
                  value={booking.numOfAdults}
                />
                <Field
                  label={t("editBooking.children")}
                  value={booking.numOfChildren}
                />
              </div>
              <Field
                label={t("editBooking.totalGuests")}
                value={booking.totalNumOfGuest}
              />
            </div>

            {/* Guest info */}
            <div style={{ padding: 24 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#0d9488",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                👤 {t("editBooking.guestInfo")}
              </div>
              <Field
                label={t("editBooking.fullName")}
                value={booking.user?.name}
              />
              <Field
                label={t("editBooking.email")}
                value={booking.user?.email}
              />
              <Field
                label={t("editBooking.phone")}
                value={booking.user?.phoneNumber}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div
            style={{
              borderTop: "1px solid #f0f2f5",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              background: "#fafbfd",
            }}
          >
            <button
              onClick={handleBack}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                color: "#555",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0d9488";
                e.currentTarget.style.color = "#0d9488";
                e.currentTarget.style.background = "#f0fdfa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#555";
                e.currentTarget.style.background = "#fff";
              }}
            >
              {t("editBooking.back")}
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid #fca5a5",
                background: "#fff5f5",
                color: "#e74c3c",
                cursor: cancelling ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: "0.9rem",
                transition: "all 0.15s",
                opacity: cancelling ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!cancelling) {
                  e.currentTarget.style.background = "#e74c3c";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff5f5";
                e.currentTarget.style.color = "#e74c3c";
              }}
            >
              {cancelling ? "..." : `🗑 ${t("editBooking.cancelBtn")}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBookingPage;
