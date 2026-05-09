import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";
import { useTranslation } from "react-i18next";

function Navbar() {
  const { t, i18n } = useTranslation(); // Lấy hàm t() để dịch
  const isAuthenticated = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isUser = ApiService.isUser();
  const navigate = useNavigate();

  // Hàm đổi ngôn ngữ
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
        left: rect.left - 100,
      });
    }
    setIsLangOpen((prev) => !prev);
  };

  // Đóng menu khi click ra ngoài
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

  const isLogout = window.confirm(
    "Are you sure you want to logout this user?",
  );

  if (isLogout) {
    ApiService.logout();
    navigate("/login");
  }
};

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false); // Chọn xong tự đóng lại
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/home">BBHH Resort</NavLink>
      </div>
      <ul className="navbar-ul">
        {/* Thay chữ cứng bằng hàm t() */}
        <li>
          <NavLink to="/home" activeclassname="active">
            {t("Home")}
          </NavLink>
        </li>
        <li>
          <NavLink to="/rooms" activeclassname="active">
            {t("Rooms")}
          </NavLink>
        </li>
        <li>
          <NavLink to="/find-booking" activeclassname="active">
            {t("Find My Booking")}
          </NavLink>
        </li>
        <li>
          <NavLink to="/services" activeclassname="active">
            {t("Services")}
          </NavLink>
        </li>

        {isUser && (
          <li>
            <NavLink to="/profile" activeclassname="active">
              {t("Profile")}
            </NavLink>
          </li>
        )}
        {isAdmin && (
          <li>
            <NavLink to="/admin" activeclassname="active">
              {t("Admin")}
            </NavLink>
          </li>
        )}

        {!isAuthenticated && (
          <li>
            <NavLink to="/login" activeclassname="active">
              {t("Login")}
            </NavLink>
          </li>
        )}
        {!isAuthenticated && (
          <li>
            <NavLink to="/register" activeclassname="active">
              {t("Register")}
            </NavLink>
          </li>
        )}
        {isAuthenticated && (
          <li>
            <NavLink
            to="/login"
            activeclassname="active"
            onClick={(e) => handleLogout(e)}
          >
            
              {t("Logout")}
            </NavLink>
          </li>
        )}

        {/* NÚT BẤM CHÍNH */}
        <li className="lang-container-fixed">
          <div className="flag-btn-trigger" ref={btnRef} onClick={toggleMenu}>
            <img
              src={`https://flagcdn.com/w40/${currentLang.country}.png`}
              width="25"
              alt="flag"
            />
            <span style={{ fontWeight: "600", color: "#333" }}>
              {currentLang.code.toUpperCase()}
            </span>
            <span style={{ color: "#666" }}>{isLangOpen ? "▲" : "▼"}</span>
          </div>

          {/* DANH SÁCH BUNG RA NGOÀI VŨ TRỤ */}
          {isLangOpen && (
            <div
              className="flag-dropdown-fixed"
              ref={langRef}
              style={{ top: coords.top, left: coords.left }}
            >
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="flag-option-item"
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w40/${lang.country}.png`}
                    width="22"
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
