import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const AdminPage = () => {
  const { t } = useTranslation("admin");
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();
  const stats = [
    {
      label: t("adminPage.single"),
      value: 80,
      color: "#0088FE",
    },
    {
      label: t("adminPage.double"),
      value: 65,
      color: "#00C49F",
    },
    {
      label: t("adminPage.luxury"),
      value: 45,
      color: "#FFBB28",
    },
    {
      label: t("adminPage.suite"),
      value: 30,
      color: "#FF8042",
    },
  ];

  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const response = await ApiService.getUserProfile();

        setAdminName(response.user.name);
      } catch (error) {
        console.error("Error fetching admin details:", error.message);
      }
    };

    fetchAdminName();
  }, []);

  return (
    <div className="bbhh-profile-container">
      <div className="bbhh-profile-card">
        <div className="bbhh-profile-header">
          <h2 className="welcome-message">
            {t("adminPage.welcome")},{" "}
            <span className="text-orange">{adminName}</span>
          </h2>

          <div className="bbhh-action-buttons">
            <button
              className="bbhh-btn bbhh-btn-edit"
              onClick={() => navigate("/admin/manage-rooms")}
            >
              {t("adminPage.manageRooms")}
            </button>

            <button
              className="bbhh-btn bbhh-btn-logout"
              onClick={() => navigate("/admin/manage-bookings")}
            >
              {t("adminPage.manageBookings")}
            </button>
          </div>
        </div>

        <div className="bbhh-profile-body">
          <div className="bbhh-box">
            <h3>{t("adminPage.systemStatus")}</h3>

            <div className="bbhh-divider"></div>

            <p>
              <strong>{t("adminPage.server")}:</strong>{" "}
              <span style={{ color: "#28a745" }}>{t("adminPage.online")}</span>
            </p>

            <p>
              <strong>{t("adminPage.database")}:</strong>{" "}
              {t("adminPage.connected")}
            </p>

            <p>
              <strong>{t("adminPage.totalStaff")}:</strong> 05
            </p>

            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                background: "#e7f3ff",
                borderRadius: "8px",
                fontSize: "0.85rem",
              }}
            >
              {t("adminPage.quickTip")}
            </div>
          </div>

          <div className="bbhh-box">
            <h3>{t("adminPage.roomPopularity")}</h3>

            <div className="bbhh-divider"></div>

            <div style={{ marginTop: "20px" }}>
              {stats.map((item, index) => (
                <div key={index} style={{ marginBottom: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>{item.label}</span>

                    <span>{item.value}%</span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "10px",
                      background: "#eee",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.value}%`,
                        height: "100%",
                        background: item.color,
                        transition: "width 1s ease-in-out",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bbhh-profile-footer">
          <p>{t("adminPage.footer")}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
