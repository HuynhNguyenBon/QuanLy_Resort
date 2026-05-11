import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import "../../UiverseElements.css";

const HomePage = () => {
  const { t } = useTranslation("home");

  const [roomSearchResults, setRoomSearchResults] = useState([]);

  // Chức năng xử lý kết quả tìm kiếm
  const handleSearchResult = (results) => {
    setRoomSearchResults(results);
  };

  return (
    <div className="home">
      {/* HEADER / BANNER ROOM SECTION */}
      <section>
        <header className="header-banner">
          <img
            src="./assets/images/hotel.webp"
            alt="BBHH Resort"
            className="header-image"
          />

          <div className="overlay"></div>

          <div className="animated-texts overlay-content">
            <h1>
              {t("welcome")} <span className="bbhh-color">BBHH Resort</span>
            </h1>

            <br />

            <h3>{t("subtitle")}</h3>
          </div>
        </header>
      </section>

      {/* SEARCH/FIND ROOM */}
      <RoomSearch handleSearchResult={handleSearchResult} />

      <RoomResult roomSearchResults={roomSearchResults} />

      <h4>
        <a className="view-rooms-home" href="/rooms">
          {t("allRooms")}
        </a>
      </h4>

      <h2 className="home-services">
        {t("servicesTitle")} <span className="bbhh-color">BBHH Resort</span>
      </h2>

      {/* SERVICES SECTION */}
      <section className="service-section">
        <div className="service-card">
          <img src="./assets/images/ac.png" alt="Air Conditioning" />

          <div className="service-details">
            <h3 className="service-title">{t("airConditioning")}</h3>

            <p className="service-description">{t("airConditioningDesc")}</p>
          </div>
        </div>

        <div className="service-card">
          <img src="./assets/images/mini-bar.png" alt="Mini Bar" />

          <div className="service-details">
            <h3 className="service-title">{t("miniBar")}</h3>

            <p className="service-description">{t("miniBarDesc")}</p>
          </div>
        </div>

        <div className="service-card">
          <img src="./assets/images/parking.png" alt="Parking" />

          <div className="service-details">
            <h3 className="service-title">{t("parking")}</h3>

            <p className="service-description">{t("parkingDesc")}</p>
          </div>
        </div>

        <div className="service-card">
          <img src="./assets/images/wifi.png" alt="WiFi" />

          <div className="service-details">
            <h3 className="service-title">{t("wifi")}</h3>

            <p className="service-description">{t("wifiDesc")}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
