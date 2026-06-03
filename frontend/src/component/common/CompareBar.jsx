import React, { useState } from "react";
import { useCompare } from "./CompareContext";

const FEATURES = [
  { label: "Loại phòng", key: "roomType" },
  { label: "Giá / đêm ($)", key: "roomPrice" },
  { label: "Mô tả", key: "roomDescription" },
];

const CompareModal = ({ rooms, onClose }) => (
  <div className="cmp-overlay" onClick={onClose}>
    <div className="cmp-modal" onClick={(e) => e.stopPropagation()}>
      <div className="cmp-modal-header">
        <h2>So sánh phòng</h2>
        <button className="cmp-modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="cmp-table-wrap">
        <table className="cmp-table">
          <thead>
            <tr>
              <th className="cmp-th-label">Tiêu chí</th>
              {rooms.map((r) => (
                <th key={r.id} className="cmp-th-room">
                  <img src={r.roomPhotoUrl} alt={r.roomType} className="cmp-room-img" />
                  <div className="cmp-room-name">{r.roomType}</div>
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
                      : r[f.key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="cmp-td-label">Tiện nghi</td>
              {rooms.map((r) => (
                <td key={r.id} className="cmp-td-val">📶 WiFi · ❄️ Điều hòa · 🏊 Hồ bơi</td>
              ))}
            </tr>
            <tr className="cmp-tr-action">
              <td className="cmp-td-label" />
              {rooms.map((r) => (
                <td key={r.id} className="cmp-td-val">
                  <a href={`/room-details-book/${r.id}`} className="cmp-book-btn">
                    Đặt phòng →
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

const CompareBar = () => {
  const { list, toggle, clear } = useCompare();
  const [showModal, setShowModal] = useState(false);

  if (list.length === 0) return null;

  return (
    <>
      <div className="cmp-bar">
        <div className="cmp-bar-left">
          <span className="cmp-bar-label">So sánh ({list.length}/3)</span>
          <div className="cmp-bar-rooms">
            {list.map((r) => (
              <div key={r.id} className="cmp-bar-room">
                <img src={r.roomPhotoUrl} alt={r.roomType} />
                <span>{r.roomType}</span>
                <button className="cmp-bar-remove" onClick={() => toggle(r)}>✕</button>
              </div>
            ))}
            {Array.from({ length: 3 - list.length }).map((_, i) => (
              <div key={`empty-${i}`} className="cmp-bar-empty">+ Thêm phòng</div>
            ))}
          </div>
        </div>
        <div className="cmp-bar-right">
          <button
            className="cmp-compare-btn"
            onClick={() => setShowModal(true)}
            disabled={list.length < 2}
          >
            So sánh ngay
          </button>
          <button className="cmp-clear-btn" onClick={clear}>Xoá tất cả</button>
        </div>
      </div>

      {showModal && <CompareModal rooms={list} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default CompareBar;
