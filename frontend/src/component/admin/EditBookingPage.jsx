import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";

const EditBookingPage = () => {
  const { t } = useTranslation("admin");

  const navigate = useNavigate();

  const { bookingCode } = useParams();

  const [bookingDetails, setBookingDetails] = useState(null);

  const [error, setError] = useState(null);

  const [success, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response =
          await ApiService.getBookingByConfirmationCode(bookingCode);

        setBookingDetails(response.booking);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchBookingDetails();
  }, [bookingCode]);

  const acheiveBooking = async (bookingId) => {
    if (!window.confirm(t("editBookingPage.confirmAchieve"))) {
      return;
    }

    try {
      const response = await ApiService.cancelBooking(bookingId);

      if (response.statusCode === 200) {
        setSuccessMessage(t("editBookingPage.achievedSuccess"));

        setTimeout(() => {
          setSuccessMessage("");

          navigate("/admin/manage-bookings");
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);

      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="bbhh-manage-booking-wrapper">
      <div className="bbhh-manage-glass-card">
        <div className="bbhh-manage-header">
          <h2>
            {t("editBookingPage.manageBooking")}:
            <span className="text-orange"> {bookingCode}</span>
          </h2>

          <div className="bbhh-divider-uiverse"></div>

          <button
            className="bbhh-btn-back-uiverse"
            onClick={() => navigate(-1)}
          >
            {t("editBookingPage.back")}
          </button>
        </div>

        {error && <div className="uiverse-error-banner">{error}</div>}

        {success && <div className="uiverse-success-banner">{success}</div>}

        {bookingDetails && (
          <div className="bbhh-manage-body">
            <div className="room-reservation-summary">
              <div className="summary-img-frame">
                <img
                  src={bookingDetails.room.roomPhotoUrl}
                  alt="Reserved Room"
                />
              </div>

              <div className="summary-details">
                <div className="field-group">
                  <label>{t("editBookingPage.roomType")}</label>

                  <span>{bookingDetails.room.roomType}</span>
                </div>

                <div className="field-group price">
                  <label>{t("editBookingPage.price")}</label>

                  <span>${bookingDetails.room.roomPrice}/ night</span>
                </div>
              </div>
            </div>

            <hr className="bbhh-manage-hr" />

            <div className="booking-info-details">
              <div className="info-glass-box">
                <h3>{t("editBookingPage.bookingDetails")}</h3>

                <div className="field-group">
                  <label>{t("editBookingPage.checkIn")}</label>

                  <div className="field-value">
                    {bookingDetails.checkInDate}
                  </div>
                </div>

                <div className="field-group">
                  <label>{t("editBookingPage.checkOut")}</label>

                  <div className="field-value">
                    {bookingDetails.checkOutDate}
                  </div>
                </div>

                <div className="guests-flex">
                  <div className="field-group">
                    <label>{t("editBookingPage.adults")}</label>

                    <div className="field-value">
                      {bookingDetails.numOfAdults}
                    </div>
                  </div>

                  <div className="field-group">
                    <label>{t("editBookingPage.children")}</label>

                    <div className="field-value">
                      {bookingDetails.numOfChildren}
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-glass-box">
                <h3>{t("editBookingPage.bookerInfo")}</h3>

                <div className="field-group">
                  <label>{t("editBookingPage.fullName")}</label>

                  <div className="field-value">{bookingDetails.user.name}</div>
                </div>

                <div className="field-group">
                  <label>{t("editBookingPage.email")}</label>

                  <div className="field-value">{bookingDetails.user.email}</div>
                </div>

                <div className="field-group">
                  <label>{t("editBookingPage.phone")}</label>

                  <div className="field-value">
                    {bookingDetails.user.phoneNumber}
                  </div>
                </div>
              </div>
            </div>

            <div className="bbhh-manage-actions">
              <button
                className="bbhh-btn-achieve"
                onClick={() => acheiveBooking(bookingDetails.id)}
              >
                {t("editBookingPage.achieveBooking")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBookingPage;
