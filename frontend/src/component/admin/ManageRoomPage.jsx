import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getRoomTranslation } from "../../data/roomTranslations";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";

const ROOMS_PER_PAGE = 10;

const TypeDropdown = ({
  options,
  value,
  onChange,
  allLabel = "Tất cả loại phòng",
  lang = "en",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getLabel = (opt) =>
    opt ? getRoomTranslation(opt, lang)?.roomType || opt : allLabel;
  const selected = getLabel(value);
  const isFiltered = !!value;

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 200 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          padding: "9px 14px",
          borderRadius: 10,
          border: `1.5px solid ${isFiltered ? "#0d9488" : "#e2e8f0"}`,
          background: isFiltered ? "#f0fdfa" : "#f8fafc",
          color: isFiltered ? "#0d9488" : "#374151",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: isFiltered ? 600 : 400,
          outline: "none",
          transition: "all 0.15s",
        }}
      >
        <span>{selected}</span>
        <span
          style={{
            fontSize: "0.7rem",
            color: isFiltered ? "#0d9488" : "#aab4be",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 12,
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {["", ...options].map((opt) => {
            const label = getLabel(opt);
            const isActive = value === opt;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: isActive ? "#fff" : "#1a1a2e",
                  background: isActive ? "#0d9488" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f0fdfa";
                  e.currentTarget.style.color = isActive ? "#fff" : "#0d9488";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive
                    ? "#0d9488"
                    : "transparent";
                  e.currentTarget.style.color = isActive ? "#fff" : "#1a1a2e";
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EXCHANGE_RATES = { vi: 25000, ja: 155, en: 1 };
const formatPrice = (amountUSD, lang) => {
  const code = (lang || "en").split("-")[0];
  if (code === "vi") {
    return `${Math.round(amountUSD * EXCHANGE_RATES.vi).toLocaleString("vi-VN")} VNĐ`;
  }
  if (code === "ja") {
    return `¥${Math.round(amountUSD * EXCHANGE_RATES.ja).toLocaleString("ja-JP")}`;
  }
  return `$${amountUSD}`;
};

const ManageRoomPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const navigate = useNavigate();
  const lang = i18n.language.split("-")[0];
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = parseInt(sessionStorage.getItem("manageRooms_currentPage"), 10);
    return saved > 0 ? saved : 1;
  });
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    ApiService.getAllRooms()
      .then((r) => setRooms(r.roomList || []))
      .catch(console.error);
    ApiService.getRoomTypes().then(setRoomTypes).catch(console.error);
  }, []);

  // Ghi nhớ trang hiện tại để khi quay lại từ trang sửa phòng thì không bị nhảy về trang 1
  useEffect(() => {
    sessionStorage.setItem("manageRooms_currentPage", String(currentPage));
  }, [currentPage]);

  const filtered = rooms.filter((r) => {
    const matchType = !selectedType || r.roomType === selectedType;
    const matchSearch =
      !search || r.roomType.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ROOMS_PER_PAGE);

  // Đảm bảo trang đã lưu vẫn hợp lệ khi danh sách phòng thay đổi (vd. lọc/tìm kiếm/xoá)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginated = filtered.slice(
    (currentPage - 1) * ROOMS_PER_PAGE,
    currentPage * ROOMS_PER_PAGE,
  );

  const handleDelete = async (id) => {
    if (!window.confirm(t("rooms.confirmDelete"))) return;
    setDeletingId(id);
    try {
      await ApiService.deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      setMsg("Đã xoá phòng thành công.");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Xoá thất bại: " + (e.response?.data?.message || e.message));
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            🛏️ {t("rooms.title")}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
            {rooms.length} {t("rooms.subtitle")}
          </p>
        </div>
        <button
          className="adm-quick-btn"
          style={{ borderLeftColor: "#0d9488", flex: "none", fontWeight: 700 }}
          onClick={() => navigate("/admin/add-room")}
        >
          ➕ {t("rooms.addRoom")}
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: "0.88rem",
            background: msg.startsWith("Xoá thất") ? "#fef2f2" : "#f0fdf4",
            color: msg.startsWith("Xoá thất") ? "#b91c1c" : "#15803d",
            border: `1px solid ${msg.startsWith("Xoá thất") ? "#fecaca" : "#bbf7d0"}`,
          }}
        >
          {msg}
        </div>
      )}

      {/* Filters */}
      <div
        className="adm-section"
        style={{ padding: "16px 20px", marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#aab4be",
                fontSize: "0.9rem",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              placeholder={t("rooms.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "9px 14px 9px 36px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: "0.875rem",
                outline: "none",
                background: "#f8fafc",
                color: "#1a1a2e",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Room type select */}
          <TypeDropdown
            options={roomTypes}
            value={selectedType}
            onChange={(v) => {
              setSelectedType(v);
              setCurrentPage(1);
            }}
            allLabel={t("rooms.allTypes")}
            lang={lang}
          />

          {/* Clear filter */}
          {(search || selectedType) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedType("");
                setCurrentPage(1);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 10,
                border: "1.5px solid #fecaca",
                background: "#fff5f5",
                cursor: "pointer",
                fontSize: "0.85rem",
                color: "#e74c3c",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.borderColor = "#e74c3c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff5f5";
                e.currentTarget.style.borderColor = "#fecaca";
              }}
            >
              <span style={{ fontSize: "0.8rem" }}>✕</span>{" "}
              {t("rooms.clearFilter")}
            </button>
          )}

          <span
            style={{
              marginLeft: "auto",
              background: "#f0fdf4",
              color: "#0d9488",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid #bbf7d0",
            }}
          >
            {filtered.length} {t("rooms.results")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="adm-section" style={{ padding: 0, overflow: "hidden" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.88rem",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f7f9fc",
                borderBottom: "2px solid #e8ecef",
              }}
            >
              {[
                t("rooms.cols.image"),
                t("rooms.cols.id"),
                t("rooms.cols.type"),
                t("rooms.cols.price"),
                t("rooms.cols.desc"),
                t("rooms.cols.actions"),
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#555",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 40, textAlign: "center", color: "#aaa" }}
                >
                  {t("rooms.noRooms")}
                </td>
              </tr>
            ) : (
              paginated.map((room, idx) => (
                <tr
                  key={room.id}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    background: idx % 2 === 0 ? "#fff" : "#fafbfd",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0fdf4")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "#fff" : "#fafbfd")
                  }
                >
                  {/* Thumbnail */}
                  <td style={{ padding: "10px 16px" }}>
                    <img
                      src={room.roomPhotoUrl}
                      alt={room.roomType}
                      style={{
                        width: 72,
                        height: 52,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e8ecef",
                      }}
                    />
                  </td>

                  {/* ID */}
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "#888",
                      fontWeight: 600,
                    }}
                  >
                    #{room.id}
                  </td>

                  {/* Loại phòng */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontWeight: 700, color: "#1a1a2e" }}>
                      {getRoomTranslation(room.roomType, lang)?.roomType ||
                        room.roomType}
                    </span>
                  </td>

                  {/* Giá */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontWeight: 700, color: "#0d9488" }}>
                      {formatPrice(room.roomPrice, lang)}
                    </span>
                  </td>

                  {/* Mô tả */}
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "#666",
                      maxWidth: 280,
                    }}
                  >
                    {(() => {
                      const desc =
                        getRoomTranslation(room.roomType, lang)
                          ?.roomDescription ||
                        room.roomDescription ||
                        "";
                      return (
                        <span title={desc}>
                          {desc
                            ? desc.length > 60
                              ? desc.slice(0, 60) + "..."
                              : desc
                            : "—"}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => navigate(`/admin/edit-room/${room.id}`)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 7,
                          border: "1px solid #0d9488",
                          background: "transparent",
                          color: "#0d9488",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#0d9488";
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#0d9488";
                        }}
                      >
                        ✎ {t("rooms.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        disabled={deletingId === room.id}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 7,
                          border: "1px solid #e74c3c",
                          background: "transparent",
                          color: "#e74c3c",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          transition: "all 0.15s",
                          opacity: deletingId === room.id ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== room.id) {
                            e.target.style.background = "#e74c3c";
                            e.target.style.color = "#fff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#e74c3c";
                        }}
                      >
                        {deletingId === room.id
                          ? "..."
                          : `🗑 ${t("rooms.delete")}`}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 0" }}>
            <Pagination
              roomsPerPage={ROOMS_PER_PAGE}
              totalRooms={filtered.length}
              currentPage={currentPage}
              paginate={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRoomPage;
