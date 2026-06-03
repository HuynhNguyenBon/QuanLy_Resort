import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const NAV_ITEMS = [
  { icon: "🗺️", label: "Sơ đồ phòng",  path: "/staff",            end: true },
  { icon: "📋", label: "Đặt phòng",     path: "/staff/bookings" },
  { icon: "👥", label: "Khách hàng",    path: "/staff/customers" },
  { icon: "💳", label: "Giao dịch",     path: "/staff/transactions" },
];

const StaffLayout = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const handleLogout = () => {
    ApiService.logout();
    navigate("/login");
  };

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <img src="/logo.png" alt="BBHH Resort"
            style={{ width: 44, height: 44, objectFit: "contain" }}
            onError={e => { e.target.style.display = "none"; }} />
          <div>
            <div className="adm-logo-name">BBHH Resort</div>
            <div className="adm-logo-sub" style={{ color: "#f59e0b" }}>Nhân viên</div>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `adm-nav-item${isActive ? " active" : ""}`}>
              <span className="adm-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="adm-logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      <div className="adm-main">
        <div className="adm-topbar">
          <div className="adm-topbar-left">
            <span className="adm-topbar-brand">BBHH Resort</span>
            <span className="adm-topbar-sep">›</span>
            <span className="adm-topbar-subtitle" style={{ color: "#f59e0b" }}>Nhân viên</span>
          </div>
          <div className="adm-topbar-right">
            <span className="adm-topbar-date">{today}</span>
          </div>
        </div>
        <div className="adm-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;
