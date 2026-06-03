import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

const ROOMS_PER_FLOOR = 5;

const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isCancelled = (b) => {
  const s = (b.bookingStatus || b.status || "").toLowerCase();
  return s === "cancelled" || s === "canceled";
};

// Kiểm tra booking có đang active hôm nay không
const isActiveBooking = (b) => {
  if (isCancelled(b)) return false;
  const today = todayDate();
  const ci = new Date(b.checkInDate);
  const co = new Date(b.checkOutDate);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);
  return ci <= today && today < co;
};

// Dùng danh sách bookings riêng (đã fetch), match theo room.id
const isOccupiedToday = (room, bookings) =>
  bookings.some(b => (b.room?.id === room.id || b.roomId === room.id) && isActiveBooking(b));

const getActiveGuest = (room, bookings) => {
  const b = bookings.find(b => (b.room?.id === room.id || b.roomId === room.id) && isActiveBooking(b));
  return b?.user?.name || null;
};

const QUICK_ACTIONS = [
  { label: "Thêm phòng mới", icon: "➕", path: "/admin/add-room", color: "#3498db" },
  { label: "Xem đặt phòng", icon: "📋", path: "/admin/manage-bookings", color: "#27ae60" },
  { label: "Quản lý phòng", icon: "🛏️", path: "/admin/manage-rooms", color: "#f39c12" },
  { label: "Xem đánh giá", icon: "⭐", path: "/admin/manage-reviews", color: "#9b59b6" },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const occupiedCount = rooms.filter(r => isOccupiedToday(r, bookings)).length;
  const availableCount = rooms.length - occupiedCount;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCheckIns = bookings.filter((b) => {
    if (b.bookingStatus === "CANCELLED") return false;
    const ci = new Date(b.checkInDate);
    return ci >= today && ci < tomorrow;
  }).length;

  const todayCheckOuts = bookings.filter((b) => {
    if (b.bookingStatus === "CANCELLED") return false;
    const co = new Date(b.checkOutDate);
    return co >= today && co < tomorrow;
  }).length;

  const stats = [
    { label: "Tổng phòng", value: rooms.length, icon: "🏨", color: "#3498db" },
    { label: "Đang có khách", value: occupiedCount, icon: "🔴", color: "#e74c3c" },
    { label: "Phòng trống", value: availableCount, icon: "🟢", color: "#27ae60" },
    { label: "Check-in hôm nay", value: todayCheckIns, icon: "📥", color: "#f39c12" },
    { label: "Check-out hôm nay", value: todayCheckOuts, icon: "📤", color: "#9b59b6" },
  ];

  const floors = [];
  for (let i = 0; i < rooms.length; i += ROOMS_PER_FLOOR) {
    floors.push(rooms.slice(i, i + ROOMS_PER_FLOOR));
  }

  return (
    <div className="adm-dashboard">
      <div className="adm-welcome">
        Xin chào, <span className="adm-welcome-name">{adminName}</span> 👋
      </div>

      {/* Stats cards */}
      <div className="adm-stats-row">
        {stats.map((s) => (
          <div key={s.label} className="adm-stat-card" style={{ borderTopColor: s.color }}>
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
          <h3>🗺️ Sơ đồ phòng</h3>
          <div className="adm-map-legend">
            <span className="adm-legend-dot" style={{ background: "#27ae60" }} />
            Trống
            <span className="adm-legend-dot" style={{ background: "#e74c3c", marginLeft: 12 }} />
            Có khách
          </div>
        </div>

        {loading ? (
          <div className="adm-map-loading">Đang tải sơ đồ phòng...</div>
        ) : floors.length === 0 ? (
          <div className="adm-map-loading">Chưa có phòng nào trong hệ thống.</div>
        ) : (
          <div className="adm-floor-map">
            {floors.map((floorRooms, floorIdx) => (
              <div key={floorIdx} className="adm-floor">
                <div className="adm-floor-label">Tầng {floorIdx + 1}</div>
                <div className="adm-floor-rooms">
                  {floorRooms.map((room) => {
                    const occupied = isOccupiedToday(room, bookings);
                    const guest = getActiveGuest(room, bookings);
                    return (
                      <div
                        key={room.id}
                        className={`adm-room-cell${occupied ? " occupied" : " available"}`}
                        title={
                          occupied
                            ? `Có khách: ${guest || "Không rõ tên"}`
                            : "Phòng trống"
                        }
                        onClick={() => navigate(`/admin/edit-room/${room.id}`)}
                      >
                        <div className="adm-room-id">#{room.id}</div>
                        <div className="adm-room-type">{room.roomType}</div>
                        {occupied && guest && (
                          <div className="adm-room-guest">{guest}</div>
                        )}
                        <div className="adm-room-status">
                          {occupied ? "Có khách" : "Trống"}
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

      {/* Quick actions — chỉ hiện cho admin */}
      {ApiService.isAdmin() && (
        <div className="adm-section">
          <div className="adm-section-header">
            <h3>⚡ Thao tác nhanh</h3>
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
    </div>
  );

};

export default AdminPage;
