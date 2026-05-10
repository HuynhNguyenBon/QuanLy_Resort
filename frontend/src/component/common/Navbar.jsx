import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

function Navbar() {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();

  const isAuthenticated = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isUser = ApiService.isUser();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const langRef = useRef(null);
  const btnRef = useRef(null);

  const languages = [
    { code: "vi", name: "Tiếng Việt", country: "vn" },
    { code: "en", name: "English", country: "us" },
    { code: "jp", name: "日本語", country: "jp" },
  ];

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleMenu = () => {
    if (!isLangOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left - 80,
      });
    }
    setIsLangOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        langRef.current &&
        !langRef.current.contains(event.target) &&
        btnRef.current &&
        !btnRef.current.contains(event.target)
      ) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();

    const confirmLogout = window.confirm(t("logout.confirm"));

    if (confirmLogout) {
      ApiService.logout();
      navigate("/login");
    }
  };

  const handleSelectLang = (code) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/home">BBHH Resort</NavLink>
      </div>

      <ul className="navbar-ul">
        <li>
          <NavLink to="/home">{t("menu.home")}</NavLink>
        </li>

        <li>
          <NavLink to="/rooms">{t("menu.rooms")}</NavLink>
        </li>

        <li>
          <NavLink to="/find-booking">{t("menu.booking")}</NavLink>
        </li>

        <li>
          <NavLink to="/services">{t("menu.services")}</NavLink>
        </li>

        {isUser && (
          <li>
            <NavLink to="/profile">{t("menu.profile")}</NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to="/admin">{t("menu.admin")}</NavLink>
          </li>
        )}

        {!isAuthenticated && (
          <li>
            <NavLink to="/login">{t("menu.login")}</NavLink>
          </li>
        )}

        {!isAuthenticated && (
          <li>
            <NavLink to="/register">{t("menu.register")}</NavLink>
          </li>
        )}

        {isAuthenticated && (
          <li>
            <NavLink to="/login" onClick={handleLogout}>
              {t("menu.logout")}
            </NavLink>
          </li>
        )}

        {/* LANGUAGE */}
        <li className="lang-container-fixed">
          <div className="flag-btn-trigger" ref={btnRef} onClick={toggleMenu}>
            <img
              src={`https://flagcdn.com/w40/${currentLang.country}.png`}
              width="22"
              alt="flag"
            />
            <span>{currentLang.code.toUpperCase()}</span>
            <span>{isLangOpen ? "▲" : "▼"}</span>
          </div>

          {isLangOpen && (
            <div
              className="flag-dropdown-fixed"
              ref={langRef}
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
              }}
            >
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="flag-option-item"
                  onClick={() => handleSelectLang(lang.code)}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.country}.png`}
                    width="20"
                    alt="flag"
                  />
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
