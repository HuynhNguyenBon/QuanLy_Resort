import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const EditProfilePage = () => {
  const { t } = useTranslation("profile");

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ApiService.getUserProfile();
        setUser(response.user);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDeleteProfile = async () => {
    if (!window.confirm(t("deleteConfirm"))) return;

    try {
      await ApiService.deleteUser(user.id);
      navigate("/signup");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="bbhh-edit-profile-wrapper">
      <div className="bbhh-edit-card">
        <div className="bbhh-edit-header">
          <h2>
            {t("editYour")}{" "}
            <span className="text-orange">{t("profileDetails")}</span>
          </h2>
          <div className="bbhh-divider-center"></div>
        </div>

        {error && <div className="bbhh-error-banner">{error}</div>}

        {user && (
          <div className="bbhh-edit-content">
            <div className="bbhh-info-group">
              <label>{t("fullName")}</label>
              <div className="bbhh-read-only-field">{user.name}</div>
            </div>

            <div className="bbhh-info-group">
              <label>{t("emailAddress")}</label>
              <div className="bbhh-read-only-field">{user.email}</div>
            </div>

            <div className="bbhh-info-group">
              <label>{t("phoneNumber")}</label>
              <div className="bbhh-read-only-field">{user.phoneNumber}</div>
            </div>

            <div className="bbhh-edit-actions">
              <p className="warning-text">{t("warning")}</p>

              <button className="bbhh-btn-danger" onClick={handleDeleteProfile}>
                {t("deleteAccount")}
              </button>

              <button
                className="bbhh-btn-back"
                onClick={() => navigate("/profile")}
              >
                {t("backToProfile")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfilePage;
