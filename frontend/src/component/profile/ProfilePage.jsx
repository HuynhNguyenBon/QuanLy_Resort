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
        const profileResponse = await ApiService.getUserProfile();
        console.log("Profile Response:", profileResponse);
        const profileUser = profileResponse.user ?? profileResponse;
        const userId = profileUser.id ?? profileUser._id;
        console.log("User ID:", userId);

        if (!userId) {
          throw new Error("Unable to determine user id.");
        }

        const bookingsResponse = await ApiService.getUserBookings(userId);
        console.log("Bookings Response:", bookingsResponse);
        
        let bookings = [];
        if (Array.isArray(bookingsResponse)) {
          bookings = bookingsResponse;
        } else if (bookingsResponse?.bookings) {
          bookings = bookingsResponse.bookings;
        } else if (bookingsResponse?.bookingList) {
          bookings = bookingsResponse.bookingList;
        } else if (bookingsResponse?.user?.bookings) {
          bookings = bookingsResponse.user.bookings;
        } else if (bookingsResponse?.data) {
          bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
        }
        
        console.log("Extracted Bookings:", bookings);
        console.log("Bookings Length:", bookings?.length);

        setUser({
          ...profileUser,
          bookings: Array.isArray(bookings) ? bookings : [],
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
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

        {/* Nội dung chia 2 cột */}
        <div className="bbhh-profile-body">
          {/* Cột 1: Info */}
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

          {/* Cột 2: History */}
          <div className="bbhh-box">
            <h3>{t("bookingHistory")}</h3>
            <div className="bbhh-divider"></div>
            <div className="bbhh-booking-list">
              {user && user.bookings && user.bookings.length > 0 ? (
                (() => {
                  console.log("All Bookings (No Filter):", user.bookings);
                  // Temporarily show ALL bookings to debug what backend returns
                  return user.bookings.map((booking) => (
                    <div key={booking.id ?? booking._id} className="bbhh-booking-item">
                      <img src={booking.room?.roomPhotoUrl} alt="Room" />
                      <div className="bbhh-booking-info">
                        <p className="bbhh-code">
                          {t("code")}: {booking.bookingConfirmationCode}
                        </p>
                        <p>
                          Status: {booking.status} | BookingStatus: {booking.bookingStatus}
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
                  ));
                })()
              ) : (
                <p>{t("noBooking")}</p>
              )}
            </div>
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
