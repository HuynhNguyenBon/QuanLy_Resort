import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCompare } from "./CompareContext";
import { getRoomTranslation } from "../../data/roomTranslations";

const CompareModal = ({ rooms, onClose }) => {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language.split("-")[0];

  const FEATURES = [
    { label: t("compare.roomType"), key: "roomType" },
    { label: t("compare.pricePerNight"), key: "roomPrice" },
    { label: t("compare.description"), key: "roomDescription" },
  ];

  return (
    <div className="cmp-overlay" onClick={onClose}>
      <div className="cmp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmp-modal-header">
          <h2>{t("compare.modalTitle")}</h2>
          <button className="cmp-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th className="cmp-th-label">{t("compare.criteria")}</th>
                {rooms.map((r) => (
                  <th key={r.id} className="cmp-th-room">
                    <img
                      src={r.roomPhotoUrl}
                      alt={r.roomType}
                      className="cmp-room-img"
                    />
                    <div className="cmp-room-name">
                      {getRoomTranslation(r.roomType, lang)?.roomType ||
                        r.roomType}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.key}>
                  <td className="cmp-td-label">{f.label}</td>
                  {rooms.map((r) => (
                    <td key={r.id} className="cmp-td-val">
                      {f.key === "roomPrice"
                        ? `$${Number(r[f.key]).toLocaleString("en-US")}`
                        : f.key === "roomType"
                          ? getRoomTranslation(r.roomType, lang)?.roomType ||
                            r[f.key] ||
                            "—"
                          : f.key === "roomDescription"
                            ? getRoomTranslation(r.roomType, lang)
                                ?.roomDescription ||
                              r[f.key] ||
                              "—"
                            : r[f.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="cmp-td-label">{t("compare.amenities")}</td>
                {rooms.map((r) => (
                  <td key={r.id} className="cmp-td-val">
                    📶 WiFi · ❄️ {t("room.ac").replace("❄️ ", "")} · 🏊{" "}
                    {t("room.pool").replace("🏊 ", "")}
                  </td>
                ))}
              </tr>
              <tr className="cmp-tr-action">
                <td className="cmp-td-label" />
                {rooms.map((r) => (
                  <td key={r.id} className="cmp-td-val">
                    <a
                      href={`/room-details-book/${r.id}`}
                      className="cmp-book-btn"
                    >
                      {t("compare.bookNow")}
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CompareBar = () => {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language.split("-")[0];
  const { list, toggle, clear } = useCompare();
  const [showModal, setShowModal] = useState(false);

  if (list.length === 0) return null;

  return (
    <>
      <div className="cmp-bar">
        <div className="cmp-bar-left">
          <span className="cmp-bar-label">
            {t("compare.label")} ({list.length}/3)
          </span>
          <div className="cmp-bar-rooms">
            {list.map((r) => (
              <div key={r.id} className="cmp-bar-room">
                <img src={r.roomPhotoUrl} alt={r.roomType} />
                <span>
                  {getRoomTranslation(r.roomType, lang)?.roomType || r.roomType}
                </span>
                <button className="cmp-bar-remove" onClick={() => toggle(r)}>
                  ✕
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - list.length }).map((_, i) => (
              <div key={`empty-${i}`} className="cmp-bar-empty">
                {t("compare.addRoom")}
              </div>
            ))}
          </div>
        </div>
        <div className="cmp-bar-right">
          <button
            className="cmp-compare-btn"
            onClick={() => setShowModal(true)}
            disabled={list.length < 2}
          >
            {t("compare.compareNow")}
          </button>
          <button className="cmp-clear-btn" onClick={clear}>
            {t("compare.clearAll")}
          </button>
        </div>
      </div>

      {showModal && (
        <CompareModal rooms={list} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default CompareBar;
