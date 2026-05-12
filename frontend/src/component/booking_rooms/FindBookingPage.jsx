import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService"; // Giả sử dịch vụ của bạn nằm trong một tệp có tên là ApiService.js
import "../../UiverseElements.css";

const FindBookingPage = () => {
  const { t } = useTranslation("rooms");

  const [confirmationCode, setConfirmationCode] = useState(""); // Biến trạng thái cho mã xác nhận
  const [bookingDetails, setBookingDetails] = useState(null); // Biến trạng thái cho chi tiết đặt phòng
  const [error, setError] = useState(null); // Theo dõi bất kỳ lỗi nào

  const handleSearch = async () => {
    if (!confirmationCode.trim()) {
      setError("Please Enter a booking confirmation code");
      setTimeout(() => setError(""), 5000);
      return;
    }
    try {
      // Gọi API để lấy chi tiết đặt phòng
      const response =
        await ApiService.getBookingByConfirmationCode(confirmationCode);
      setBookingDetails(response.booking);
      setError(null); // Xóa lỗi nếu thành công
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Access denied") {
        setError(t("roomDetailsPage.forbidden"));
      } else if (message === "Room is not available for the selected dates") {
        setError(t("roomDetailsPage.roomNotAvailable"));
      } else if (message === "Room already booked for selected dates.") {
        setError(t("roomDetailsPage.roomBooked"));
      } else {
        setError(t("roomDetailsPage.general"));
      }
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

      {error && (
        <p className="text-center" style={{ color: "red", fontWeight: "500" }}>
          {error}
        </p>
      )}

      {bookingDetails && (
        <div className="booking-details-card">
          <h3 className="booking-section-title">
            {t("findBookingPage.bookingInfo")}
          </h3>
          <div className="booking-info-grid">
            <div className="info-item">
              <label>{t("findBookingPage.confirmationCode")}</label>
              <span style={{ color: "#ff9800" }}>
                {bookingDetails.bookingConfirmationCode}
              </span>
            </div>
            <div className="info-item">
              <label>{t("findBookingPage.checkIn")}</label>
              <span>{bookingDetails.checkInDate}</span>
            </div>
            <div className="info-item">
              <label>{t("findBookingPage.checkOut")}</label>
              <span>{bookingDetails.checkOutDate}</span>
            </div>
            <div className="info-item">
              <label>{t("findBookingPage.adultsChildren")}</label>
              <span>
                {bookingDetails.numOfAdults} Adults -{" "}
                {bookingDetails.numOfChildren} Children
              </span>
            </div>
          </div>

          <h3 className="booking-section-title">
            {t("findBookingPage.guestDetails")}
          </h3>
          <div className="booking-info-grid">
            <div className="info-item">
              <label>{t("findBookingPage.fullName")}</label>
              <span>{bookingDetails.user.name}</span>
            </div>
            <div className="info-item">
              <label>{t("findBookingPage.emailAddress")}</label>
              <span>{bookingDetails.user.email}</span>
            </div>
            <div className="info-item">
              <label>{t("findBookingPage.phoneNumber")}</label>
              <span>{bookingDetails.user.phoneNumber}</span>
            </div>
          </div>

          <h3 className="booking-section-title">
            {t("findBookingPage.roomDetails")}
          </h3>
          <div
            className="room-card-uiverse"
            style={{ width: "100%", display: "flex", flexDirection: "row" }}
          >
            <div
              className="room-image-box"
              style={{ width: "40%", height: "250px" }}
            >
              <img src={bookingDetails.room.roomPhotoUrl} alt="Room" />
            </div>
            <div className="room-content-box" style={{ width: "60%" }}>
              <h4 className="room-title">{bookingDetails.room.roomType}</h4>
              <p className="room-desc">{t("findBookingPage.thankYou")}</p>
              <div className="room-price">{t("findBookingPage.verified")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindBookingPage;
