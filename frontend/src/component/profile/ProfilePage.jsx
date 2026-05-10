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
        {/* HEADER */}
        <div className="bbhh-profile-header">
          {user && (
            <h2>
              {t("welcome")}, <span className="text-orange">{user.name}</span>
            </h2>
          )}

          <div className="bbhh-action-buttons">
            <button onClick={handleEditProfile}>{t("editProfile")}</button>

            <button onClick={handleLogout}>{t("logout")}</button>
          </div>
        </div>

        {error && <p className="bbhh-error">{error}</p>}

        <div className="bbhh-profile-body">
          {/* INFO */}
          {user && (
            <div className="bbhh-box">
              <h3>{t("profileDetails")}</h3>
              <p>
                <strong>{t("email")}:</strong> {user.email}
              </p>
              <p>
                <strong>{t("phone")}:</strong> {user.phoneNumber}
              </p>
            </div>
          )}

          {/* BOOKINGS */}
          <div className="bbhh-box">
            <h3>{t("bookingHistory")}</h3>

            {user && user.bookings?.length > 0 ? (
              user.bookings.map((b) => (
                <div key={b.id} className="bbhh-booking-item">
                  <img src={b.room?.roomPhotoUrl} alt="room" />

                  <div>
                    <p>
                      {t("code")}: {b.bookingConfirmationCode}
                    </p>
                    <p>
                      {t("checkIn")}: {b.checkInDate}
                    </p>
                    <p>
                      {t("room")}: {b.room?.roomType}
                    </p>
                    <p>
                      {t("guests")}: {b.totalNumOfGuest}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>{t("noBooking")}</p>
            )}
          </div>
        </div>

        <div className="bbhh-profile-footer">
          <p>{t("footer")}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
