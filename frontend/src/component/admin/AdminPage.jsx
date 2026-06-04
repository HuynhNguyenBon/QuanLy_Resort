import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

const ROOMS_PER_FLOOR = 5;

const todayDate = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const isCancelled = (b) => { const s = (b.bookingStatus||b.status||"").toLowerCase(); return s==="cancelled"||s==="canceled"; };
const isActiveBooking = (b) => {
  if (isCancelled(b)) return false;
  const today = todayDate();
  const ci = new Date(b.checkInDate); ci.setHours(0,0,0,0);
  const co = new Date(b.checkOutDate); co.setHours(0,0,0,0);
  return ci <= today && today < co;
};
const isOccupiedToday = (room, bookings) =>
  bookings.some(b => (b.room?.id === room.id || b.roomId === room.id) && isActiveBooking(b));
const getActiveBooking = (room, bookings) =>
  bookings.find(b => (b.room?.id === room.id || b.roomId === room.id) && isActiveBooking(b)) || null;
const getActiveGuest = (room, bookings) => {
  const b = getActiveBooking(room, bookings);
  return b?.user?.name || null;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const AdminPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const navigate = useNavigate();
  const [adminName,   setAdminName]   = useState("");
  const [rooms,       setRooms]       = useState([]);
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [roomPopup,   setRoomPopup]   = useState(null); // { room, booking }

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

  const occupiedCount  = rooms.filter(r => isOccupiedToday(r, bookings)).length;
  const availableCount = rooms.length - occupiedCount;

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCheckIns  = bookings.filter(b => !isCancelled(b) && new Date(b.checkInDate)  >= today && new Date(b.checkInDate)  < tomorrow).length;
  const todayCheckOuts = bookings.filter(b => !isCancelled(b) && new Date(b.checkOutDate) >= today && new Date(b.checkOutDate) < tomorrow).length;

  const stats = [
    { label: t("overview.totalRooms"),    value: rooms.length,   icon: "🏨", color: "#3498db" },
    { label: t("overview.occupied"),      value: occupiedCount,  icon: "🔴", color: "#e74c3c" },
    { label: t("overview.available"),     value: availableCount, icon: "🟢", color: "#27ae60" },
    { label: t("overview.todayCheckin"),  value: todayCheckIns,  icon: "📥", color: "#f39c12" },
    { label: t("overview.todayCheckout"), value: todayCheckOuts, icon: "📤", color: "#9b59b6" },
  ];

  const QUICK_ACTIONS = [
    { label: t("overview.addRoom"),       icon: "➕", path: "/admin/add-room",        color: "#3498db" },
    { label: t("overview.viewBookings"),  icon: "📋", path: "/admin/manage-bookings", color: "#27ae60" },
    { label: t("overview.manageRooms"),   icon: "🛏️", path: "/admin/manage-rooms",    color: "#f39c12" },
    { label: t("overview.viewReviews"),   icon: "⭐", path: "/admin/manage-reviews",  color: "#9b59b6" },
  ];

  const floors = [];
  for (let i = 0; i < rooms.length; i += ROOMS_PER_FLOOR)
    floors.push(rooms.slice(i, i + ROOMS_PER_FLOOR));

  return (
    <div className="adm-dashboard">
      <div className="adm-welcome">
        {t("overview.greeting")}, <span className="adm-welcome-name">{adminName}</span> 👋
      </div>

      {/* Stats */}
      <div className="adm-stats-row">
        {stats.map(s => (
          <div key={s.label} className="adm-stat-card" style={{ borderTopColor: s.color }}>
            <div className="adm-stat-icon">{s.icon}</div>
            <div className="adm-stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Floor map */}
      <div className="adm-section">
        <div className="adm-section-header">
          <h3>🗺️ {t("overview.floorMap")}</h3>
          <div className="adm-map-legend">
            <span className="adm-legend-dot" style={{ background: "#27ae60" }} />
            {t("overview.available_label")}
            <span className="adm-legend-dot" style={{ background: "#e74c3c", marginLeft: 12 }} />
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
                <div className="adm-floor-label">{i18n.language==="ja"?"フロア":"Tầng"} {floorIdx + 1}</div>
                <div className="adm-floor-rooms">
                  {floorRooms.map(room => {
                    const occupied = isOccupiedToday(room, bookings);
                    const guest    = getActiveGuest(room, bookings);
                    const booking = getActiveBooking(room, bookings);
                    return (
                      <div key={room.id}
                        className={`adm-room-cell${occupied ? " occupied" : " available"}`}
                        onClick={() => occupied
                          ? setRoomPopup({ room, booking })
                          : navigate(`/admin/edit-room/${room.id}`)}>
                        <div className="adm-room-id">#{room.id}</div>
                        <div className="adm-room-type">{room.roomType}</div>
                        {occupied && guest && <div className="adm-room-guest">{guest}</div>}
                        <div className="adm-room-status">
                          {occupied ? t("overview.occupied_label") : t("overview.available_label")}
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
            {QUICK_ACTIONS.map(a => (
              <button key={a.path} className="adm-quick-btn"
                style={{ borderLeftColor: a.color }}
                onClick={() => navigate(a.path)}>
                <span className="adm-quick-icon">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popup thông tin khách */}
      {roomPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setRoomPopup(null)}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #e74c3c, #c0392b)",
              padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  🛏️ Phòng #{roomPopup.room.id} — {roomPopup.room.roomType}
                </div>
                <div style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: 2 }}>
                  🔴 {t("overview.occupied_label")}
                </div>
              </div>
              <button onClick={() => setRoomPopup(null)}
                style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "#fff",
                  width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: "0.9rem",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              {roomPopup.booking ? (
                <>
                  {[
                    { icon: "👤", label: t("users.cols.customer"),   value: roomPopup.booking.user?.name || "—" },
                    { icon: "📧", label: t("users.cols.email"),      value: roomPopup.booking.user?.email || "—" },
                    { icon: "📱", label: t("staff.cols.phone"),      value: roomPopup.booking.user?.phoneNumber || "—" },
                    { icon: "🎫", label: t("bookings.cols.code"),    value: roomPopup.booking.bookingConfirmationCode },
                    { icon: "📅", label: t("bookings.cols.checkin"), value: fmtDate(roomPopup.booking.checkInDate) },
                    { icon: "📅", label: t("bookings.cols.checkout"),value: fmtDate(roomPopup.booking.checkOutDate) },
                    { icon: "👥", label: t("bookings.cols.guests"),  value: roomPopup.booking.totalNumOfGuest },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                        {icon}
                      </span>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                        <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.9rem" }}>{value || "—"}</div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#aaa", padding: 20 }}>
                  {t("bookings.noBookings")}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f2f5",
              display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setRoomPopup(null); navigate(`/admin/edit-room/${roomPopup.room.id}`); }}
                style={{ padding: "9px 16px", borderRadius: 9, border: "1.5px solid #e2e8f0",
                  background: "#fff", color: "#555", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                ✎ {t("rooms.edit")}
              </button>
              {roomPopup.booking && (
                <button onClick={() => { setRoomPopup(null); navigate(`/admin/edit-booking/${roomPopup.booking.bookingConfirmationCode}`); }}
                  style={{ padding: "9px 16px", borderRadius: 9, border: "none",
                    background: "#0d9488", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>
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
