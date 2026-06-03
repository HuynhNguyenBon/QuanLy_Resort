import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const NAV_ITEMS = [
  { icon: "📊", label: "Tổng quan",       path: "/admin",                       end: true },
  { icon: "🛏️", label: "Quản lý phòng",   path: "/admin/manage-rooms" },
  { icon: "📋", label: "Đặt phòng",       path: "/admin/manage-bookings" },
  { icon: "💳", label: "Giao dịch",       path: "/admin/transactions" },
  { icon: "💰", label: "Doanh thu",       path: "/admin/revenue" },
  { icon: "👥", label: "Khách hàng",      path: "/admin/manage-users" },
  { icon: "👨‍💼", label: "Nhân viên",       path: "/admin/manage-staff" },
  { icon: "🛎️", label: "Dịch vụ",         path: "/admin/manage-services" },
  { icon: "⭐", label: "Đánh giá",        path: "/admin/manage-reviews" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    ApiService.logout();
    navigate("/login");
  };

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <img src="/logo.png" alt="BBHH Resort" style={{ width: 44, height: 44, objectFit: "contain" }} />
          <div>
            <div className="adm-logo-name">BBHH Resort</div>
            <div className="adm-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `adm-nav-item${isActive ? " active" : ""}`}
            >
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
            <span className="adm-topbar-subtitle">Hệ thống quản lý</span>
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

export default AdminLayout;
