import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import ApiService from "../../service/ApiService";
import { getRoomTranslation } from "../../data/roomTranslations";
import "../../UiverseElements.css";

const RoomSearch = ({ handleSearchResult }) => {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language.split("-")[0];
  const getRoomTypeLabel = (type) =>
    getRoomTranslation(type, lang)?.roomType || type;
  const getDateFormat = () => {
    switch (i18n.language) {
      case "vi":
        return "dd/MM/yyyy";

      case "en":
        return "MM/dd/yyyy";

      case "ja":
        return "yyyy/MM/dd";

      default:
        return "dd/MM/yyyy";
    }
  };

  const dateFormat = getDateFormat();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [roomType, setRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    ApiService.getRoomTypes()
      .then((types) => setRoomTypes(types))
      .catch((err) => console.error(err.message));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showError = (msg, ms = 5000) => {
    setError(msg);
    setTimeout(() => setError(""), ms);
  };

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      showError(t("search.selectDates"));
      return;
    }
    if (startDate >= endDate) {
      showError(t("search.invalidCheckoutDate"));
      return;
    }

    setLoading(true);
    setError("");

    setLoading(true);
    setError("");

    try {
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      let availableRooms = [];

      if (roomType) {
        // Có chọn loại — gọi 1 API
        const res = await ApiService.getAvailableRoomsByDateAndType(
          start,
          end,
          roomType,
        );
        availableRooms = res.roomList || [];
      } else {
        // Không chọn loại — gọi song song tất cả loại rồi gộp lại
        const results = await Promise.all(
          roomTypes.map((type) =>
            ApiService.getAvailableRoomsByDateAndType(start, end, type)
              .then((r) => r.roomList || [])
              .catch(() => []),
          ),
        );
        availableRooms = results.flat();
      }

      if (availableRooms.length === 0) {
        showError(t("search.noAvailableRooms"));
        return;
      }

      handleSearchResult(availableRooms);
    } catch (err) {
      showError(t("search.searchError"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedLabel = roomType
    ? getRoomTypeLabel(roomType)
    : t("search.selectRoomType");

  return (
    <section>
      <div className="search-container">
        {/* Check-in */}
        <div className="search-field">
          <label>{t("search.checkIn")}</label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat={dateFormat}
            placeholderText={t("search.selectCheckIn")}
            minDate={new Date()}
            autoComplete="off"
          />
        </div>

        {/* Check-out */}
        <div className="search-field">
          <label>{t("search.checkOut")}</label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            dateFormat={dateFormat}
            placeholderText={t("search.selectCheckOut")}
            minDate={startDate || new Date()}
            autoComplete="off"
          />
        </div>

        {/* Loại phòng — tuỳ chọn */}
        <div className="search-field search-field-drop" ref={dropRef}>
          <label>
            {t("search.roomType")}{" "}
            <span style={{ fontWeight: 400, opacity: 0.6 }}></span>
            <span style={{ fontWeight: 400, opacity: 0.6 }}>
              {t("search.tc")}
            </span>
          </label>
          <button
            type="button"
            className={`search-drop-trigger${roomType ? " selected" : ""}`}
            onClick={() => setDropOpen((p) => !p)}
          >
            <span>{selectedLabel}</span>
            <svg
              className={`search-drop-chevron${dropOpen ? " open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropOpen && (
            <div className="search-drop-menu">
              <div
                className={`search-drop-item${!roomType ? " active" : ""}`}
                onClick={() => {
                  setRoomType("");
                  setDropOpen(false);
                }}
              >
                {t("search.allTypes")}
              </div>
              {roomTypes.map((type) => (
                <div
                  key={type}
                  className={`search-drop-item${roomType === type ? " active" : ""}`}
                  onClick={() => {
                    setRoomType(type);
                    setDropOpen(false);
                  }}
                >
                  {roomType === type && (
                    <span className="search-drop-check">✓</span>
                  )}
                  {getRoomTypeLabel(type)}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="home-search-button"
          onClick={handleSearch}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? t("search.searching") : t("search.button")}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </section>
  );
};

export default RoomSearch;
