import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";

const groupReviewsByRoom = (reviews) => {
  const map = new Map();
  reviews.forEach((r) => {
    const roomId = String(r.roomId);
    if (!map.has(roomId)) map.set(roomId, []);
    map.get(roomId).push(r);
  });
  return Array.from(map.entries())
    .map(([roomId, list]) => ({ roomId, reviews: list }))
    .sort((a, b) =>
      a.roomId.localeCompare(b.roomId, undefined, { numeric: true }),
    );
};

const Stars = ({ value }) => (
  <span style={{ letterSpacing: 1 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        style={{
          color: n <= value ? "#f59e0b" : "#e5e7eb",
          fontSize: "0.9rem",
        }}
      >
        ★
      </span>
    ))}
  </span>
);

const ManageReviewsPage = () => {
  const { t } = useTranslation("adminPanel");
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);

  const refresh = useCallback(() => {
    ApiService.getAllReviews()
      .then((r) => setGroups(groupReviewsByRoom(r.reviewList || r || [])))
      .catch(() => setGroups([]));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteReview = async (roomId, reviewId) => {
    try {
      await ApiService.deleteReview(reviewId);
      refresh();
    } catch {
      /* ignore */
    }
  };

  const clearRoom = async (roomId) => {
    if (!window.confirm(`${t("reviews.confirmClear")} #${roomId}?`)) return;
    try {
      await ApiService.deleteReviewsByRoom(roomId);
      refresh();
    } catch {
      /* ignore */
    }
  };

  const totalCount = groups.reduce((s, g) => s + g.reviews.length, 0);
  const avgRating =
    totalCount === 0
      ? 0
      : groups.reduce(
          (s, g) => s + g.reviews.reduce((ss, r) => ss + r.rating, 0),
          0,
        ) / totalCount;

  const filtered = groups
    .map((g) => ({
      ...g,
      reviews: g.reviews.filter(
        (r) =>
          (!search ||
            r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.comment?.toLowerCase().includes(search.toLowerCase())) &&
          r.rating >= minRating,
      ),
    }))
    .filter((g) => g.reviews.length > 0);

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>⭐</span>{" "}
            {t("reviews.title")}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
            {totalCount} {t("reviews.subtitle")} {groups.length}{" "}
            {t("reviews.subtitleRooms")}
            {totalCount > 0 && (
              <span
                style={{ marginLeft: 8, color: "#f59e0b", fontWeight: 600 }}
              >
                · ★ {avgRating.toFixed(1)}/5
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: t("reviews.totalReviews"),
            value: totalCount,
            icon: "💬",
            color: "#6366f1",
            light: "#eef2ff",
          },
          {
            label: t("reviews.totalRooms"),
            value: groups.length,
            icon: "🛏️",
            color: "#0d9488",
            light: "#f0fdfa",
          },
          {
            label: t("reviews.avgRating"),
            value: avgRating.toFixed(1) + " ★",
            icon: "⭐",
            color: "#f59e0b",
            light: "#fffbeb",
          },
          {
            label: t("reviews.fiveStars"),
            value: groups.reduce(
              (s, g) => s + g.reviews.filter((r) => r.rating === 5).length,
              0,
            ),
            icon: "🏆",
            color: "#16a34a",
            light: "#f0fdf4",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="adm-section"
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: s.light,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1.2,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="adm-section"
        style={{ padding: "14px 20px", marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", minWidth: 260 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#aab4be",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              placeholder={t("reviews.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px 9px 36px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: "0.875rem",
                outline: "none",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              background: "#f1f5f9",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {[0, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  background: minRating === r ? "#fff" : "transparent",
                  color: minRating === r ? "#f59e0b" : "#64748b",
                  fontWeight: minRating === r ? 700 : 400,
                  boxShadow:
                    minRating === r ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {r === 0 ? t("reviews.allStars") : `${r}★+`}
              </button>
            ))}
          </div>

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
            {filtered.reduce((s, g) => s + g.reviews.length, 0)}{" "}
            {t("reviews.results")}
          </span>
        </div>
      </div>

      {/* Content */}
      {totalCount === 0 ? (
        <div
          className="adm-section"
          style={{ padding: 60, textAlign: "center", color: "#aaa" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: "0.95rem" }}>{t("reviews.noReviews")}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="adm-section"
          style={{ padding: 60, textAlign: "center", color: "#aaa" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔍</div>
          <div>{t("reviews.noResults")}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(({ roomId, reviews }) => (
            <div
              key={roomId}
              className="adm-section"
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* Room header */}
              <div
                style={{
                  padding: "14px 20px",
                  background: "#f7f9fc",
                  borderBottom: "1px solid #e8ecef",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.9rem",
                  }}
                >
                  🛏️ Phòng #{roomId}
                </span>
                <span
                  style={{
                    background: "#f0fdfa",
                    color: "#0d9488",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "1px solid #ccfbf1",
                  }}
                >
                  {reviews.length} {t("reviews.results")}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#f59e0b",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  ★{" "}
                  {(
                    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                  ).toFixed(1)}
                </span>
                <button
                  onClick={() => clearRoom(roomId)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    border: "1px solid #fca5a5",
                    background: "#fff5f5",
                    color: "#e74c3c",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e74c3c";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff5f5";
                    e.currentTarget.style.color = "#e74c3c";
                  }}
                >
                  🗑 {t("reviews.clearRoom")}
                </button>
              </div>

              {/* Reviews */}
              {reviews.map((r, idx) => (
                <div
                  key={r.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom:
                      idx < reviews.length - 1 ? "1px solid #f0f2f5" : "none",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    background: idx % 2 === 0 ? "#fff" : "#fafbfd",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `hsl(${((r.name?.charCodeAt(0) || 72) * 5) % 360}, 60%, 55%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {(r.name || "?").charAt(0).toUpperCase()}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#1a1a2e",
                          fontSize: "0.88rem",
                        }}
                      >
                        {r.name}
                      </span>
                      <Stars value={r.rating} />
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          marginLeft: "auto",
                        }}
                      >
                        {r.date}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {r.comment}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteReview(roomId, r.id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 7,
                      border: "1px solid #fca5a5",
                      background: "#fff5f5",
                      color: "#e74c3c",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e74c3c";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff5f5";
                      e.currentTarget.style.color = "#e74c3c";
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReviewsPage;
