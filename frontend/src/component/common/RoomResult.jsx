import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const RoomResult = ({ roomSearchResults }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const isAdmin = ApiService.isAdmin();

  if (!roomSearchResults || roomSearchResults.length === 0) return null;

  return (
    <section className="room-results">
      <div className="room-list-uiverse">
        {roomSearchResults.map(room => (
          <div key={room.id} className="room-card-uiverse">
            <div className="room-image-box">
              <img src={room.roomPhotoUrl} alt={room.roomType} />
            </div>
            <div className="room-content-box">
              <h3 className="room-title">{room.roomType}</h3>
              <p className="room-price">
                {room.roomPrice?.toLocaleString("vi-VN")}$ / {t("room.perNight")}
              </p>
              <p className="room-desc">{room.roomDescription}</p>
              <div className="room-amenities-tags">
                <span>{t("room.wifi")}</span>
                <span>{t("room.pool")}</span>
                <span>{t("room.ac")}</span>
              </div>
              <div className="room-actions">
                {isAdmin ? (
                  <button
                    className="btn-uiverse admin"
                    onClick={() => navigate(`/admin/edit-room/${room.id}`)}
                  >
                    {t("room.edit")}
                  </button>
                ) : (
                  <button
                    className="btn-uiverse user"
                    onClick={() => navigate(`/room-details-book/${room.id}`)}
                  >
                    {t("room.book")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomResult;
