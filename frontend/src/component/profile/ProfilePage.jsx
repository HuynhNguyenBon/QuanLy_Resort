import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const ProfilePage = () => {
  const { t } = useTranslation("profile");

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ApiService.getUserProfile();

        // Fetch user bookings using the fetched user ID
        const userPlusBookings = await ApiService.getUserBookings(
          response.user.id,
        );

        setUser(userPlusBookings.user);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    ApiService.logout();
    navigate("/home");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="bbhh-profile-container">
      <div className="bbhh-profile-card">
        {/* Header */}
        <div className="bbhh-profile-header">
          {user && (
            <h2>
              {t("welcome")}, <span className="text-orange">{user.name}</span>
            </h2>
          )}

          <div className="bbhh-action-buttons">
            <button
              className="bbhh-btn bbhh-btn-edit"
              onClick={handleEditProfile}
            >
              {t("editProfile")}
            </button>

            <button className="bbhh-btn bbhh-btn-logout" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </div>

        {error && <p className="bbhh-error">{error}</p>}

        {/* Body */}
        <div className="bbhh-profile-body">
          {/* Profile Info */}
          {user && (
            <div className="bbhh-box">
              <h3>{t("profileDetails")}</h3>

              <div className="bbhh-divider"></div>

              <p>
                <strong>{t("email")}:</strong> {user.email}
              </p>

              <p>
                <strong>{t("phone")}:</strong> {user.phoneNumber}
              </p>
            </div>
          )}

          {/* Booking History */}
          <div className="bbhh-box">
            <h3>{t("bookingHistory")}</h3>

            <div className="bbhh-divider"></div>

            <div className="bbhh-booking-list">
              {user && user.bookings && user.bookings.length > 0 ? (
                user.bookings.map((booking) => (
                  <div key={booking.id} className="bbhh-booking-item">
                    <img src={booking.room?.roomPhotoUrl} alt="Room" />

                    <div className="bbhh-booking-info">
                      <p className="bbhh-code">
                        {t("code")}: {booking.bookingConfirmationCode}
                      </p>

                      <p>
                        {t("checkIn")}: {booking.checkInDate}
                      </p>

                      <p>
                        {t("room")}: {booking.room?.roomType}
                      </p>

                      <p>
                        {t("guests")}: {booking.totalNumOfGuest}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>{t("noBooking")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bbhh-profile-footer">
          <p>{t("footer")}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
