import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const FindBookingPage = () => {
  const { t } = useTranslation("rooms");

  const [confirmationCode, setConfirmationCode] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!confirmationCode.trim()) {
      setError(t("findBookingPage.enterCode"));
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {
      const response =
        await ApiService.getBookingByConfirmationCode(confirmationCode);

      setBookingDetails(response.booking);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message);

      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="find-booking-page">
      <h2 className="home-services text-center">
        {t("findBookingPage.findYour")}{" "}
        <span className="bbhh-color">{t("findBookingPage.reservation")}</span>
      </h2>

      <div className="search-container-uiverse">
        <div className="uiverse-input-wrapper">
          <input
            required
            type="text"
            className="uiverse-input-field"
            placeholder={t("findBookingPage.placeholder")}
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
          />
        </div>

        <button
          className="btn-uiverse user"
          style={{ maxWidth: "200px" }}
          onClick={handleSearch}
        >
          {t("findBookingPage.searchBooking")}
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {bookingDetails && (
        <div className="booking-details-card">
          <h3>{t("findBookingPage.bookingInfo")}</h3>

          <div>
            <p>
              {t("findBookingPage.confirmationCode")}:{" "}
              {bookingDetails.bookingConfirmationCode}
            </p>

            <p>
              {t("findBookingPage.checkIn")}: {bookingDetails.checkInDate}
            </p>

            <p>
              {t("findBookingPage.checkOut")}: {bookingDetails.checkOutDate}
            </p>

            <p>
              {t("findBookingPage.adultsChildren")}:{" "}
              {bookingDetails.numOfAdults} / {bookingDetails.numOfChildren}
            </p>
          </div>

          <h3>{t("findBookingPage.guestDetails")}</h3>

          <p>{bookingDetails.user.name}</p>
          <p>{bookingDetails.user.email}</p>
          <p>{bookingDetails.user.phoneNumber}</p>

          <h3>{t("findBookingPage.roomDetails")}</h3>

          <p>{bookingDetails.room.roomType}</p>

          <p>{t("findBookingPage.thankYou")}</p>

          <span>{t("findBookingPage.verified")}</span>
        </div>
      )}
    </div>
  );
};

export default FindBookingPage;
