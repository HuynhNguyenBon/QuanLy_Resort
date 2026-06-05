import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";

const ROOMS_PER_FLOOR = 5;

const ROOM_LIMITS = {
  Standard: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  Superior: { maxAdults: 2, maxChildren: 2, maxTotal: 3 },
  Deluxe: { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
  Suite: { maxAdults: 4, maxChildren: 3, maxTotal: 5 },
  Family: { maxAdults: 4, maxChildren: 4, maxTotal: 6 },
  King: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  Queen: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  Studio: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
  Executive: { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
  Presidential: { maxAdults: 6, maxChildren: 4, maxTotal: 8 },
  Precidential: { maxAdults: 6, maxChildren: 4, maxTotal: 8 },
  Bali: { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
};
const DEFAULT_LIMIT = { maxAdults: 2, maxChildren: 2, maxTotal: 3 };

const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const isCancelled = (b) => {
  const s = (b.bookingStatus || b.status || "").toLowerCase();
  return s === "cancelled" || s === "canceled";
};
const isActiveBooking = (b) => {
  if (isCancelled(b)) return false;
  const today = todayDate();
  const ci = new Date(b.checkInDate);
  ci.setHours(0, 0, 0, 0);
  const co = new Date(b.checkOutDate);
  co.setHours(0, 0, 0, 0);
  return ci <= today && today < co;
};
const isOccupiedToday = (room, bookings) =>
  bookings.some(
    (b) =>
      (b.room?.id === room.id || b.roomId === room.id) && isActiveBooking(b),
  );
const getActiveBooking = (room, bookings) =>
  bookings.find(
    (b) =>
      (b.room?.id === room.id || b.roomId === room.id) && isActiveBooking(b),
  ) || null;
const getActiveGuest = (room, bookings) => {
  const b = getActiveBooking(room, bookings);
  return b?.user?.name || null;
};
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
const toInputDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const AdminPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomPopup, setRoomPopup] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, roomsRes, bookingsRes] = await Promise.all([
          ApiService.getUserProfile(),
          ApiService.getAllRooms(),
          ApiService.getAllBookings(),
        ]);
        setAdminName(profileRes.user?.name || "Admin");
        setRooms(roomsRes.roomList || []);
        setBookings(bookingsRes.bookingList || []);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const occupiedCount = rooms.filter((r) =>
    isOccupiedToday(r, bookings),
  ).length;
  const availableCount = rooms.length - occupiedCount;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCheckIns = bookings.filter(
    (b) =>
      !isCancelled(b) &&
      new Date(b.checkInDate) >= today &&
      new Date(b.checkInDate) < tomorrow,
  ).length;
  const todayCheckOuts = bookings.filter(
    (b) =>
      !isCancelled(b) &&
      new Date(b.checkOutDate) >= today &&
      new Date(b.checkOutDate) < tomorrow,
  ).length;

  const stats = [
    {
      label: t("overview.totalRooms"),
      value: rooms.length,
      icon: "🏨",
      color: "#3498db",
    },
    {
      label: t("overview.occupied"),
      value: occupiedCount,
      icon: "🔴",
      color: "#e74c3c",
    },
    {
      label: t("overview.available"),
      value: availableCount,
      icon: "🟢",
      color: "#27ae60",
    },
    {
      label: t("overview.todayCheckin"),
      value: todayCheckIns,
      icon: "📥",
      color: "#f39c12",
    },
    {
      label: t("overview.todayCheckout"),
      value: todayCheckOuts,
      icon: "📤",
      color: "#9b59b6",
    },
  ];

  const QUICK_ACTIONS = [
    {
      label: t("overview.addRoom"),
      icon: "➕",
      path: "/admin/add-room",
      color: "#3498db",
    },
    {
      label: t("overview.viewBookings"),
      icon: "📋",
      path: "/admin/manage-bookings",
      color: "#27ae60",
    },
    {
      label: t("overview.manageRooms"),
      icon: "🛏️",
      path: "/admin/manage-rooms",
      color: "#f39c12",
    },
    {
      label: t("overview.viewReviews"),
      icon: "⭐",
      path: "/admin/manage-reviews",
      color: "#9b59b6",
    },
  ];

  const startEdit = () => {
    const b = roomPopup.booking;
    setEditForm({
      checkInDate: toInputDate(b.checkInDate),
      checkOutDate: toInputDate(b.checkOutDate),
      numOfAdults: b.numOfAdults ?? b.totalNumOfGuest ?? 1,
      numOfChildren: b.numOfChildren ?? 0,
      bookingStatus: b.bookingStatus || b.status || "BOOKED",
    });
    setSaveMsg("");
    setRoomPopup((p) => ({ ...p, editMode: true }));
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const adults = Number(editForm.numOfAdults) || 0;
      const children = Number(editForm.numOfChildren) || 0;
      const roomType =
        roomPopup?.room?.roomType || roomPopup?.booking?.room?.roomType || "";
      const limit = ROOM_LIMITS[roomType] || DEFAULT_LIMIT;
      if (adults < 1) {
        setSaveMsg("❌ " + t("editBooking.errMinAdults"));
        setSaving(false);
        return;
      }
      if (adults > limit.maxAdults) {
        setSaveMsg(
          "❌ " +
            t("editBooking.errMaxAdults", {
              count: limit.maxAdults,
              type: roomType,
            }),
        );
        setSaving(false);
        return;
      }
      if (children > limit.maxChildren) {
        setSaveMsg(
          "❌ " +
            t("editBooking.errMaxChildren", {
              count: limit.maxChildren,
              type: roomType,
            }),
        );
        setSaving(false);
        return;
      }
      if (adults + children > limit.maxTotal) {
        setSaveMsg(
          "❌ " +
            t("editBooking.errMaxTotal", {
              count: limit.maxTotal,
              type: roomType,
            }),
        );
        setSaving(false);
        return;
      }
      const payload = {
        ...editForm,
        numOfAdults: adults,
        numOfChildren: children,
        totalNumOfGuest: adults + children,
      };
      await ApiService.updateBooking(roomPopup.booking.id, payload);
      const res = await ApiService.getAllBookings();
      setBookings(res.bookingList || []);
      setSaveMsg("✅ Đã lưu thành công");
      setRoomPopup((p) => ({
        ...p,
        editMode: false,
        booking: {
          ...p.booking,
          ...editForm,
          totalNumOfGuest:
            Number(editForm.numOfAdults) + Number(editForm.numOfChildren),
        },
      }));
    } catch (err) {
      console.error(
        "updateBooking error:",
        err?.response?.data || err?.message || err,
      );
      const detail = err?.response?.data?.message || err?.message || "";
      setSaveMsg(
        "❌ " + t("editBooking.errSave") + (detail ? ": " + detail : "."),
      );
    } finally {
      setSaving(false);
    }
  };

  const floors = [];
  for (let i = 0; i < rooms.length; i += ROOMS_PER_FLOOR)
    floors.push(rooms.slice(i, i + ROOMS_PER_FLOOR));

  return (
    <div className="adm-dashboard">
      <div className="adm-welcome">
        {t("overview.greeting")},{" "}
        <span className="adm-welcome-name">{adminName}</span> 👋
      </div>

      {/* Stats */}
      <div className="adm-stats-row">
        {stats.map((s) => (
          <div
            key={s.label}
            className="adm-stat-card"
            style={{ borderTopColor: s.color }}
          >
            <div className="adm-stat-icon">{s.icon}</div>
            <div className="adm-stat-value" style={{ color: s.color }}>
              {loading ? "—" : s.value}
            </div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Floor map */}
      <div className="adm-section">
        <div className="adm-section-header">
          <h3>🗺️ {t("overview.floorMap")}</h3>
          <div className="adm-map-legend">
            <span
              className="adm-legend-dot"
              style={{ background: "#27ae60" }}
            />
            {t("overview.available_label")}
            <span
              className="adm-legend-dot"
              style={{ background: "#e74c3c", marginLeft: 12 }}
            />
            {t("overview.occupied_label")}
          </div>
        </div>

        {loading ? (
          <div className="adm-map-loading">{t("revenue.loading")}</div>
        ) : floors.length === 0 ? (
          <div className="adm-map-loading">{t("rooms.noRooms")}</div>
        ) : (
          <div className="adm-floor-map">
            {floors.map((floorRooms, floorIdx) => (
              <div key={floorIdx} className="adm-floor">
                <div className="adm-floor-label">
                  {i18n.language === "ja" ? "フロア" : "Tầng"} {floorIdx + 1}
                </div>
                <div className="adm-floor-rooms">
                  {floorRooms.map((room) => {
                    const occupied = isOccupiedToday(room, bookings);
                    const guest = getActiveGuest(room, bookings);
                    const booking = getActiveBooking(room, bookings);
                    return (
                      <div
                        key={room.id}
                        className={`adm-room-cell${occupied ? " occupied" : " available"}`}
                        onClick={() =>
                          occupied
                            ? setRoomPopup({ room, booking })
                            : ApiService.isAdmin() &&
                              navigate(`/admin/edit-room/${room.id}`)
                        }
                      >
                        <div className="adm-room-id">#{room.id}</div>
                        <div className="adm-room-type">{room.roomType}</div>
                        {occupied && guest && (
                          <div className="adm-room-guest">{guest}</div>
                        )}
                        <div className="adm-room-status">
                          {occupied
                            ? t("overview.occupied_label")
                            : t("overview.available_label")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions — admin only */}
      {ApiService.isAdmin() && (
        <div className="adm-section">
          <div className="adm-section-header">
            <h3>⚡ {t("overview.quickActions")}</h3>
          </div>
          <div className="adm-quick-actions">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.path}
                className="adm-quick-btn"
                style={{ borderLeftColor: a.color }}
                onClick={() => navigate(a.path)}
              >
                <span className="adm-quick-icon">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popup thông tin khách */}
      {roomPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setRoomPopup(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: roomPopup.detailMode ? 520 : 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
              transition: "max-width 0.2s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: roomPopup.detailMode
                  ? "linear-gradient(135deg, #0d9488, #0f766e)"
                  : "linear-gradient(135deg, #e74c3c, #c0392b)",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {roomPopup.detailMode && (
                  <button
                    onClick={() =>
                      setRoomPopup((p) => ({ ...p, detailMode: false }))
                    }
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "#fff",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    ←
                  </button>
                )}
                <div style={{ color: "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                    🛏️ {t("transactions.cols.room")} #{roomPopup.room.id} —{" "}
                    {roomPopup.room.roomType}
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: 2 }}
                  >
                    {roomPopup.detailMode
                      ? `📋 ${t("editBooking.title")}`
                      : `🔴 ${t("overview.occupied_label")}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRoomPopup(null)}
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Body — chế độ chi tiết */}
            {roomPopup.detailMode ? (
              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Ảnh phòng */}
                {roomPopup.room.roomPhotoUrl && (
                  <div
                    style={{
                      position: "relative",
                      height: 200,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={roomPopup.room.roomPhotoUrl}
                      alt={roomPopup.room.roomType}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        bottom: 12,
                        left: 16,
                        background: "rgba(13,148,136,0.9)",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {roomPopup.room.roomType}
                    </span>
                  </div>
                )}

                {/* Thông tin booking */}
                <div
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                  }}
                >
                  {/* Mã xác nhận nổi bật */}
                  {roomPopup.booking && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>🎫</span>
                      <div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#6b7280",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {t("bookings.cols.code")}
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#0d9488",
                            fontSize: "1rem",
                            letterSpacing: 1,
                          }}
                        >
                          {roomPopup.booking.bookingConfirmationCode}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2 cột thông tin / form sửa */}
                  {roomPopup.booking &&
                    (roomPopup.editMode ? (
                      /* ── EDIT FORM ── */
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {saveMsg && (
                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              background: saveMsg.startsWith("✅")
                                ? "#f0fdf4"
                                : "#fef2f2",
                              color: saveMsg.startsWith("✅")
                                ? "#166534"
                                : "#991b1b",
                              border: `1px solid ${saveMsg.startsWith("✅") ? "#86efac" : "#fca5a5"}`,
                            }}
                          >
                            {saveMsg}
                          </div>
                        )}
                        {(() => {
                          const roomType =
                            roomPopup?.room?.roomType ||
                            roomPopup?.booking?.room?.roomType ||
                            "";
                          const limit = ROOM_LIMITS[roomType] || DEFAULT_LIMIT;
                          return (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                              }}
                            >
                              {[
                                {
                                  key: "checkInDate",
                                  label: "📅 " + t("bookings.cols.checkin"),
                                  type: "date",
                                  min: undefined,
                                  max: undefined,
                                  hint: null,
                                },
                                {
                                  key: "checkOutDate",
                                  label: "📅 " + t("bookings.cols.checkout"),
                                  type: "date",
                                  min: undefined,
                                  max: undefined,
                                  hint: null,
                                },
                                {
                                  key: "numOfAdults",
                                  label: "🧑 " + t("editBooking.adults"),
                                  type: "number",
                                  min: 1,
                                  max: limit.maxAdults,
                                  hint: t("editBooking.maxAdults", {
                                    count: limit.maxAdults,
                                  }),
                                },
                                {
                                  key: "numOfChildren",
                                  label: "👶 " + t("editBooking.children"),
                                  type: "number",
                                  min: 0,
                                  max: limit.maxChildren,
                                  hint: t("editBooking.maxChildren", {
                                    count: limit.maxChildren,
                                  }),
                                },
                              ].map(({ key, label, type, min, max, hint }) => (
                                <div key={key}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      marginBottom: 4,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.68rem",
                                        color: "#94a3b8",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {label}
                                    </span>
                                    {hint && (
                                      <span
                                        style={{
                                          fontSize: "0.65rem",
                                          background: "#f0fdf4",
                                          color: "#0d9488",
                                          border: "1px solid #bbf7d0",
                                          borderRadius: 10,
                                          padding: "1px 7px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {hint}
                                      </span>
                                    )}
                                  </div>
                                  <input
                                    type={type}
                                    min={min}
                                    max={max}
                                    value={editForm[key] ?? ""}
                                    onChange={(e) =>
                                      setEditForm((f) => ({
                                        ...f,
                                        [key]: e.target.value,
                                      }))
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "8px 10px",
                                      borderRadius: 8,
                                      border: "1.5px solid #e2e8f0",
                                      fontSize: "0.88rem",
                                      fontFamily: "inherit",
                                      outline: "none",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        <div>
                          <div
                            style={{
                              fontSize: "0.68rem",
                              color: "#94a3b8",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            📊 {t("bookings.cols.status")}
                          </div>
                          <select
                            value={editForm.bookingStatus ?? ""}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                bookingStatus: e.target.value,
                              }))
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1.5px solid #e2e8f0",
                              fontSize: "0.88rem",
                              fontFamily: "inherit",
                              outline: "none",
                              background: "#fff",
                            }}
                          >
                            {[
                              {
                                value: "BOOKED",
                                label: t("editBooking.statusBooked"),
                              },
                              {
                                value: "CONFIRMED",
                                label: t("editBooking.statusConfirmed"),
                              },
                              {
                                value: "CHECKED_IN",
                                label: t("editBooking.statusCheckedIn"),
                              },
                              {
                                value: "CHECKED_OUT",
                                label: t("editBooking.statusCheckedOut"),
                              },
                              {
                                value: "CANCELLED",
                                label: t("editBooking.statusCancelled"),
                              },
                            ].map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Thông tin khách (read-only trong edit) */}
                        <div
                          style={{
                            borderTop: "1px dashed #e2e8f0",
                            paddingTop: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {[
                            {
                              icon: "👤",
                              label: t("users.cols.customer"),
                              value: roomPopup.booking.user?.name,
                            },
                            {
                              icon: "📧",
                              label: t("users.cols.email"),
                              value: roomPopup.booking.user?.email,
                            },
                            {
                              icon: "📱",
                              label: t("staff.cols.phone"),
                              value: roomPopup.booking.user?.phoneNumber,
                            },
                          ].map(({ icon, label, value }) => (
                            <div
                              key={label}
                              style={{
                                fontSize: "0.82rem",
                                color: "#64748b",
                                display: "flex",
                                gap: 6,
                              }}
                            >
                              <span>{icon}</span>
                              <span style={{ fontWeight: 600 }}>{label}:</span>
                              <span>{value || "—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          {[
                            {
                              icon: "📅",
                              label: t("bookings.cols.checkin"),
                              value: fmtDate(roomPopup.booking.checkInDate),
                            },
                            {
                              icon: "📅",
                              label: t("bookings.cols.checkout"),
                              value: fmtDate(roomPopup.booking.checkOutDate),
                            },
                            {
                              icon: "👥",
                              label: t("bookings.cols.guests"),
                              value: roomPopup.booking.totalNumOfGuest,
                            },
                            {
                              icon: "📊",
                              label: t("bookings.cols.status"),
                              value:
                                roomPopup.booking.bookingStatus ||
                                roomPopup.booking.status ||
                                "—",
                            },
                          ].map(({ icon, label, value }) => (
                            <div
                              key={label}
                              style={{
                                background: "#f8fafc",
                                borderRadius: 10,
                                padding: "12px 14px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#94a3b8",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 4,
                                }}
                              >
                                {icon} {label}
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#1a1a2e",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {value || "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            borderTop: "1px solid #f0f0f0",
                            paddingTop: 14,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {t("users.cols.customer")}
                          </div>
                          {[
                            {
                              icon: "👤",
                              label: t("users.cols.customer"),
                              value: roomPopup.booking.user?.name,
                            },
                            {
                              icon: "📧",
                              label: t("users.cols.email"),
                              value: roomPopup.booking.user?.email,
                            },
                            {
                              icon: "📱",
                              label: t("staff.cols.phone"),
                              value: roomPopup.booking.user?.phoneNumber,
                            },
                          ].map(({ icon, label, value }) => (
                            <div
                              key={label}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <span
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 8,
                                  background: "#f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {icon}
                              </span>
                              <div>
                                <div
                                  style={{
                                    fontSize: "0.68rem",
                                    color: "#94a3b8",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {label}
                                </div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "#1a1a2e",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {value || "—"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ))}
                </div>
              </div>
            ) : (
              /* Body — chế độ compact */
              <div
                style={{
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {roomPopup.booking ? (
                  <>
                    {[
                      {
                        icon: "👤",
                        label: t("users.cols.customer"),
                        value: roomPopup.booking.user?.name || "—",
                      },
                      {
                        icon: "📧",
                        label: t("users.cols.email"),
                        value: roomPopup.booking.user?.email || "—",
                      },
                      {
                        icon: "📱",
                        label: t("staff.cols.phone"),
                        value: roomPopup.booking.user?.phoneNumber || "—",
                      },
                      {
                        icon: "🎫",
                        label: t("bookings.cols.code"),
                        value: roomPopup.booking.bookingConfirmationCode,
                      },
                      {
                        icon: "📅",
                        label: t("bookings.cols.checkin"),
                        value: fmtDate(roomPopup.booking.checkInDate),
                      },
                      {
                        icon: "📅",
                        label: t("bookings.cols.checkout"),
                        value: fmtDate(roomPopup.booking.checkOutDate),
                      },
                      {
                        icon: "👥",
                        label: t("bookings.cols.guests"),
                        value: roomPopup.booking.totalNumOfGuest,
                      },
                    ].map(({ icon, label, value }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          {icon}
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "#94a3b8",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#1a1a2e",
                              fontSize: "0.9rem",
                            }}
                          >
                            {value || "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{ textAlign: "center", color: "#aaa", padding: 20 }}
                  >
                    {t("bookings.noBookings")}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #f0f2f5",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              {roomPopup.editMode ? (
                <>
                  <button
                    onClick={() =>
                      setRoomPopup((p) => ({ ...p, editMode: false }))
                    }
                    disabled={saving}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 9,
                      border: "1.5px solid #e2e8f0",
                      background: "#fff",
                      color: "#555",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("staff.addModal.cancelBtn")}
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    style={{
                      padding: "9px 20px",
                      borderRadius: 9,
                      border: "none",
                      background: saving ? "#94a3b8" : "#0d9488",
                      color: "#fff",
                      cursor: saving ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {saving
                      ? t("staff.addModal.saving")
                      : "💾 " + t("staff.addModal.updateBtn")}
                  </button>
                </>
              ) : roomPopup.detailMode ? (
                /* Detail mode: chỉ hiện nút Sửa */
                <button
                  onClick={startEdit}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 9,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#555",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  ✎ {t("rooms.edit")}
                </button>
              ) : (
                /* Compact mode: chỉ hiện nút Chi tiết */
                <button
                  onClick={() =>
                    setRoomPopup((p) => ({ ...p, detailMode: true }))
                  }
                  style={{
                    padding: "9px 16px",
                    borderRadius: 9,
                    border: "none",
                    background: "#0d9488",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  📋 {t("bookings.details")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
