import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const LANGS = [
  { code: "vi", name: "Tiếng Việt", country: "vn" },
  { code: "en", name: "English", country: "us" },
  { code: "ja", name: "日本語", country: "jp" },
];

const StaffLayout = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const currentLang = LANGS.find((l) => l.code === i18n.language) || LANGS[0];

  const today = new Date().toLocaleDateString(
    i18n.language === "ja"
      ? "ja-JP"
      : i18n.language === "vi"
        ? "vi-VN"
        : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NAV_ITEMS = [
    { icon: "🗺️", label: t("nav.floorMap"), path: "/staff", end: true },
    { icon: "📋", label: t("nav.bookings"), path: "/staff/bookings" },
    { icon: "👥", label: t("nav.customers"), path: "/staff/customers" },
    { icon: "💳", label: t("nav.transactions"), path: "/staff/transactions" },
  ];

  const handleLogout = () => {
    ApiService.logout();
    navigate("/login");
  };

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <img
            src="/logo.png"
            alt="BBHH Resort"
            style={{ width: 44, height: 44, objectFit: "contain" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div>
            <div className="adm-logo-name">{t("brand")}</div>
            <div className="adm-logo-sub" style={{ color: "#f59e0b" }}>
              {t("staffPanel")}
            </div>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `adm-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="adm-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="adm-logout-btn" onClick={handleLogout}>
          🚪 {t("logout")}
        </button>
      </aside>

      <div className="adm-main">
        <div className="adm-topbar">
          <div className="adm-topbar-left">
            <span className="adm-topbar-brand">{t("brand")}</span>
            <span className="adm-topbar-sep">›</span>
            <span className="adm-topbar-subtitle" style={{ color: "#f59e0b" }}>
              {t("staffPanel")}
            </span>
          </div>
          <div
            className="adm-topbar-right"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <span className="adm-topbar-date">{today}</span>

            {/* Language switcher */}
            <div ref={langRef} style={{ position: "relative" }}>
              <button
                onClick={() => setLangOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${currentLang.country}.png`}
                  width="18"
                  height="12"
                  alt={currentLang.code}
                  style={{ borderRadius: 2 }}
                />
                <span>{currentLang.code.toUpperCase()}</span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#aaa",
                    transform: langOpen ? "rotate(180deg)" : "none",
                    transition: "0.2s",
                  }}
                >
                  ▼
                </span>
              </button>

              {langOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "#fff",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 999,
                    overflow: "hidden",
                    minWidth: 140,
                  }}
                >
                  {LANGS.map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        background:
                          lang.code === i18n.language
                            ? "#f0fdfa"
                            : "transparent",
                        color:
                          lang.code === i18n.language ? "#0d9488" : "#1a1a2e",
                        fontWeight: lang.code === i18n.language ? 700 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (lang.code !== i18n.language)
                          e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          lang.code === i18n.language
                            ? "#f0fdfa"
                            : "transparent";
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${lang.country}.png`}
                        width="20"
                        height="13"
                        alt={lang.code}
                        style={{ borderRadius: 2 }}
                      />
                      {lang.name}
                      {lang.code === i18n.language && (
                        <span style={{ marginLeft: "auto", color: "#0d9488" }}>
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
