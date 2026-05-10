import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";

import ApiService from "../../service/ApiService";

const RoomSearch = ({ handleSearchResult }) => {
  const { t } = useTranslation("common");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [roomType, setRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchRoomTypes();
  }, []);

  const showError = (message, timeout = 5000) => {
    setError(message);
    setTimeout(() => setError(""), timeout);
  };

  const handleInternalSearch = async () => {
    if (!startDate || !endDate || !roomType) {
      showError(t("search.fillAll"));
      return;
    }

    try {
      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = endDate.toISOString().split("T")[0];

      const res = await ApiService.getAvailableRoomsByDateAndType(
        formattedStart,
        formattedEnd,
        roomType,
      );

      if (res.statusCode === 200) {
        if (res.roomList.length === 0) {
          showError(t("search.notAvailable"));
          return;
        }

        handleSearchResult(res.roomList);
        setError("");
      }
    } catch (error) {
      showError(t("search.error") + error.message);
    }
  };

  return (
    <section>
      <div className="search-container">
        <div className="search-field">
          <label>{t("search.checkIn")}</label>

          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="dd/MM/yyyy"
            placeholderText={t("search.selectCheckIn")}
          />
        </div>

        <div className="search-field">
          <label>{t("search.checkOut")}</label>

          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            dateFormat="dd/MM/yyyy"
            placeholderText={t("search.selectCheckOut")}
          />
        </div>

        <div className="search-field">
          <label>{t("search.roomType")}</label>

          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="">{t("search.selectRoomType")}</option>

            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <button className="home-search-button" onClick={handleInternalSearch}>
          {t("search.button")}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </section>
  );
};

export default RoomSearch;
