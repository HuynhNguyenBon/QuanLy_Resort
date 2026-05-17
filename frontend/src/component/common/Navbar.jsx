import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

function Navbar() {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isUser = ApiService.isUser();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langPos, setLangPos] = useState({ top: 0, right: 0 });
  const [userPos, setUserPos] = useState({ top: 0, right: 0 });

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

  const navClass = `bbhh-nav ${isHeroPage && !scrolled ? "nav-transparent" : "nav-solid"}`;

  return (
    <>
      {!isHeroPage && <div className="bbhh-nav-spacer" />}

      <nav className={navClass}>
        {/* Logo */}
        <NavLink to="/home" className="bbhh-nav-logo">
          <span className="logo-star">★</span> BBHH Resort
        </NavLink>

        {/* Links */}
        <div className="bbhh-nav-links">
          {[
            { to: "/home", label: t("menu.home") },
            { to: "/rooms", label: t("menu.rooms") },
            ...(!isAuthenticated
              ? [{ to: "/find-booking", label: t("menu.booking") }]
              : []),
            { to: "/services", label: t("menu.services") },
          ].map((item) => (
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

        {/* Right */}
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
      </nav>
    </>
  );
}

export default Navbar;
