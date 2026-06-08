import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

function Navbar() {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();
  const location = useLocation();

  const [, setAuthVersion] = useState(0);
  const isAuthenticated = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isUser = ApiService.isUser();

  // localStorage không tự kích hoạt re-render trong React. Lắng nghe sự kiện "authChanged"
  // (phát ra khi token được khôi phục lặng lẽ, ví dụ sau khi quay về từ VNPay) để Navbar
  // đọc lại localStorage và cập nhật trạng thái đăng nhập ngay trên trang hiện tại.
  useEffect(() => {
    const onAuthChanged = () => setAuthVersion((v) => v + 1);
    window.addEventListener("authChanged", onAuthChanged);
    return () => window.removeEventListener("authChanged", onAuthChanged);
  }, []);

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langPos, setLangPos] = useState({ top: 0, right: 0 });
  const [userPos, setUserPos] = useState({ top: 0, right: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const langBtnRef = useRef(null);
  const userBtnRef = useRef(null);

  const isHeroPage = ["/home", "/"].includes(location.pathname);

  const languages = [
    { code: "vi", name: "Tiếng Việt", country: "vn" },
    { code: "en", name: "English", country: "us" },
    { code: "ja", name: "日本語", country: "jp" },
  ];
  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsLangOpen(false);
    setIsUserOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (langBtnRef.current && !langBtnRef.current.contains(e.target))
        setIsLangOpen(false);
      if (userBtnRef.current && !userBtnRef.current.contains(e.target))
        setIsUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openLang = () => {
    if (langBtnRef.current) {
      const r = langBtnRef.current.getBoundingClientRect();
      setLangPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setIsLangOpen((p) => !p);
    setIsUserOpen(false);
  };

  const openUser = () => {
    if (userBtnRef.current) {
      const r = userBtnRef.current.getBoundingClientRect();
      setUserPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setIsUserOpen((p) => !p);
    setIsLangOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm(t("logout.confirm"))) {
      ApiService.logout();
      navigate("/login");
    }
  };

  const navLinks = [
    { to: "/home", label: t("menu.home") },
    { to: "/rooms", label: t("menu.rooms") },
    ...(!isAuthenticated
      ? [{ to: "/find-booking", label: t("menu.booking") }]
      : []),
    { to: "/services", label: t("menu.services") },
    { to: "/promotions", label: t("menu.offers") },
    { to: "/gallery", label: t("menu.gallery") },
    { to: "/contact", label: t("menu.contact") },
  ];

  const navClass = `bbhh-nav ${isHeroPage && !scrolled ? "nav-transparent" : "nav-solid"}`;

  return (
    <>
      {!isHeroPage && <div className="bbhh-nav-spacer" />}

      <nav className={navClass}>
        {/* Logo */}
        <NavLink to="/home" className="bbhh-nav-logo">
          <span className="logo-star">★</span> BBHH Resort
        </NavLink>

        {/* Desktop Links */}
        <div className="bbhh-nav-links">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `bbhh-nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="bbhh-nav-right">
          {isAdmin && (
            <button
              className="bbhh-nav-btn-admin"
              onClick={() => navigate("/admin")}
            >
              🛡️ {t("menu.admin")}
            </button>
          )}

          {!isAuthenticated ? (
            <>
              <button
                className="bbhh-nav-btn-login"
                onClick={() => navigate("/login")}
              >
                {t("menu.login")}
              </button>
              <button
                className="bbhh-nav-btn-register"
                onClick={() => navigate("/register")}
              >
                {t("menu.register")}
              </button>
            </>
          ) : (
            <div ref={userBtnRef} style={{ position: "relative" }}>
              <button
                className={`bbhh-nav-avatar ${isAdmin ? "avatar-admin" : "avatar-user"}`}
                onClick={openUser}
                title="Tài khoản"
              >
                {isAdmin ? "👑" : "👤"}
              </button>
              {isUserOpen && (
                <div
                  className="bbhh-nav-dropdown"
                  style={{ top: userPos.top, right: userPos.right }}
                >
                  <div className="bbhh-nav-dropdown-head">
                    <div className="dd-role">Đã đăng nhập</div>
                    <div className="dd-name">
                      {isAdmin ? "Administrator" : "Thành viên"}
                    </div>
                  </div>
                  {isUser && (
                    <div
                      className="bbhh-nav-dd-item"
                      onClick={() => {
                        navigate("/profile");
                        setIsUserOpen(false);
                      }}
                    >
                      👤 {t("menu.profile")}
                    </div>
                  )}
                  {isAdmin && (
                    <div
                      className="bbhh-nav-dd-item"
                      onClick={() => {
                        navigate("/admin");
                        setIsUserOpen(false);
                      }}
                    >
                      🛡️ Trang quản trị
                    </div>
                  )}
                  <div
                    className="bbhh-nav-dd-item danger"
                    onClick={handleLogout}
                  >
                    🚪 {t("menu.logout")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language */}
          <div ref={langBtnRef} style={{ position: "relative" }}>
            <button className="bbhh-nav-lang-btn" onClick={openLang}>
              <img
                src={`https://flagcdn.com/w40/${currentLang.country}.png`}
                width="18"
                height="12"
                alt={currentLang.code}
              />
              {currentLang.code.toUpperCase()} {isLangOpen ? "▲" : "▼"}
            </button>
            {isLangOpen && (
              <div
                className="bbhh-nav-dropdown"
                style={{
                  top: langPos.top,
                  right: langPos.right,
                  minWidth: "160px",
                }}
              >
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`bbhh-nav-dd-lang${lang.code === i18n.language ? " selected" : ""}`}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${lang.country}.png`}
                      width="20"
                      height="13"
                      alt={lang.code}
                    />
                    {lang.name}
                    {lang.code === i18n.language && (
                      <span className="check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="bbhh-nav-hamburger"
          onClick={() => setIsMenuOpen((p) => !p)}
          aria-label="Mở menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="bbhh-mobile-overlay"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="bbhh-mobile-drawer">
            {/* Header */}
            <div className="bbhh-mobile-drawer-head">
              <span className="bbhh-mobile-drawer-logo">
                <span style={{ color: "#F59E0B" }}>★</span> BBHH Resort
              </span>
              <button
                className="bbhh-mobile-drawer-close"
                onClick={() => setIsMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Nav Links */}
            <div className="bbhh-mobile-nav-links">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `bbhh-mobile-nav-link${isActive ? " active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="bbhh-mobile-divider" />

            {/* Auth */}
            <div className="bbhh-mobile-auth">
              {!isAuthenticated ? (
                <>
                  <button
                    className="bbhh-mobile-btn-login"
                    onClick={() => navigate("/login")}
                  >
                    {t("menu.login")}
                  </button>
                  <button
                    className="bbhh-mobile-btn-register"
                    onClick={() => navigate("/register")}
                  >
                    {t("menu.register")}
                  </button>
                </>
              ) : (
                <>
                  <div className="bbhh-mobile-user-info">
                    <span className="bbhh-mobile-user-role">
                      Đã đăng nhập —{" "}
                      {isAdmin ? "Administrator" : "Thành viên"}
                    </span>
                  </div>
                  {isUser && (
                    <button
                      className="bbhh-mobile-btn-login"
                      onClick={() => navigate("/profile")}
                    >
                      👤 {t("menu.profile")}
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      className="bbhh-mobile-btn-login"
                      onClick={() => navigate("/admin")}
                    >
                      🛡️ {t("menu.admin")}
                    </button>
                  )}
                  <button
                    className="bbhh-mobile-btn-logout"
                    onClick={handleLogout}
                  >
                    🚪 {t("menu.logout")}
                  </button>
                </>
              )}
            </div>

            <div className="bbhh-mobile-divider" />

            {/* Language */}
            <div className="bbhh-mobile-lang-section">
              <div className="bbhh-mobile-lang-title">Ngôn ngữ</div>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`bbhh-mobile-lang-item${lang.code === i18n.language ? " selected" : ""}`}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsMenuOpen(false);
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.country}.png`}
                    width="20"
                    height="13"
                    alt={lang.code}
                  />
                  {lang.name}
                  {lang.code === i18n.language && (
                    <span className="bbhh-mobile-lang-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
