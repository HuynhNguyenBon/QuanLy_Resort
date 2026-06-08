import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { formatPrice } from "../../utils/formatPrice";
import { getRoomTranslation } from "../../data/roomTranslations";
import "../../UiverseElements.css";

const RoomResult = ({ roomSearchResults }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language.split("-")[0];
  const isAdmin = ApiService.isAdmin();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    if (!roomSearchResults || roomSearchResults.length === 0) return;

    const fetchAllTranslations = async () => {
      const results = await Promise.allSettled(
        roomSearchResults.map((room) =>
          ApiService.getRoomTranslation(room.id, lang)
            .then((trans) => ({ id: room.id, trans }))
            .catch(() => ({ id: room.id, trans: null })),
        ),
      );

      const map = {};
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.trans) {
          map[r.value.id] = r.value.trans;
        }
      });
      setTranslations(map);
    };
    fetchAllTranslations();
  }, [roomSearchResults, lang]);

  const getRoomType = (room) =>
    translations[room.id]?.roomType ||
    getRoomTranslation(room.roomType, lang)?.roomType ||
    room.roomType ||
    "";

  const getRoomDescription = (room) =>
    translations[room.id]?.roomDescription ||
    getRoomTranslation(room.roomType, lang)?.roomDescription ||
    room.roomDescription ||
    "";

  if (!roomSearchResults || roomSearchResults.length === 0) return null;

  return (
    <section className="room-results">
      <div className="room-list-uiverse">
        {roomSearchResults.map((room) => (
          <div key={room.id} className="room-card-uiverse">
            <div className="room-image-box">
              <img src={room.roomPhotoUrl} alt={getRoomType(room)} />
            </div>
            <div className="room-content-box">
              <h3 className="room-title">{getRoomType(room)}</h3>
              <p className="room-price">
                {formatPrice(room.roomPrice, lang)} / {t("room.perNight")}
              </p>
              <p className="room-desc">{getRoomDescription(room)}</p>
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
