import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";

const PER_PAGE = 10;

const getStatusKey = (b) => {
  const p = (b.paymentStatus || "").toUpperCase();
  if (p === "PAID") return "paid";
  const s = (b.bookingStatus || b.status || "").toLowerCase();
  if (s === "confirmed" || s === "true") return "paid";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  return "pending";
};

const STATUS = {
  paid: {
    label: "Đã thanh toán",
    bg: "#f0fdf4",
    color: "#15803d",
    border: "#bbf7d0",
    dot: "#22c55e",
  },
  pending: {
    label: "Chờ thanh toán",
    bg: "#fffbeb",
    color: "#b45309",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  cancelled: {
    label: "Đã huỷ",
    bg: "#fef2f2",
    color: "#b91c1c",
    border: "#fecaca",
    dot: "#ef4444",
  },
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
const fmtMoney = (v) => (v != null ? `$${Number(v).toLocaleString()}` : "—");

const ManageBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    ApiService.getAllBookings()
      .then((r) => {
        const list = r.bookingList ?? r.bookings ?? r.data ?? r;
        setBookings(Array.isArray(list) ? list : (list?.bookingList ?? []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      (b.bookingConfirmationCode || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (b.user?.name || b.guestName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (b.user?.email || b.guestEmail || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus = !statusFilter || getStatusKey(b) === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const counts = {
    all: bookings.length,
    paid: bookings.filter((b) => getStatusKey(b) === "paid").length,
    pending: bookings.filter((b) => getStatusKey(b) === "pending").length,
    cancelled: bookings.filter((b) => getStatusKey(b) === "cancelled").length,
  };

  const totalRevenue = bookings
    .filter((b) => getStatusKey(b) === "paid")
    .reduce((s, b) => s + Number(b.totalPrice || 0), 0);

  const STAT_CARDS = [
    {
      label: "Tổng đặt phòng",
      value: counts.all,
      icon: "📋",
      color: "#6366f1",
      light: "#eef2ff",
    },
    {
      label: "Đã thanh toán",
      value: counts.paid,
      icon: "✅",
      color: "#16a34a",
      light: "#f0fdf4",
    },
    {
      label: "Chờ thanh toán",
      value: counts.pending,
      icon: "⏳",
      color: "#d97706",
      light: "#fffbeb",
    },
    {
      label: "Doanh thu",
      value: fmtMoney(totalRevenue),
      icon: "💰",
      color: "#0d9488",
      light: "#f0fdfa",
    },
  ];

  const FILTERS = [
    { key: "", label: "Tất cả", count: counts.all },
    { key: "paid", label: "Đã thanh toán", count: counts.paid },
    { key: "pending", label: "Chờ thanh toán", count: counts.pending },
    { key: "cancelled", label: "Đã huỷ", count: counts.cancelled },
  ];

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
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
          <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>📋</span> Đặt
          phòng
        </h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
          Quản lý tất cả đặt phòng trong hệ thống
        </p>
      </div>

      {/* Search + filters */}
      <div
        className="adm-section"
        style={{ padding: "14px 20px", marginBottom: 16 }}
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
          <div
            style={{
              position: "relative",
              minWidth: 260,
              flex: 1,
              maxWidth: 360,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#aab4be",
                pointerEvents: "none",
                fontSize: "0.9rem",
              }}
            >
              🔍
            </span>
            <input
              placeholder="Tìm mã xác nhận, tên, email..."
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
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Status tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              background: "#f1f5f9",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key);
                  setCurrentPage(1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  background: statusFilter === f.key ? "#fff" : "transparent",
                  color: statusFilter === f.key ? "#0d9488" : "#64748b",
                  fontWeight: statusFilter === f.key ? 700 : 400,
                  boxShadow:
                    statusFilter === f.key
                      ? "0 1px 4px rgba(0,0,0,0.08)"
                      : "none",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label}
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 10,
                    fontSize: "0.72rem",
                    background: statusFilter === f.key ? "#f0fdfa" : "#e2e8f0",
                    color: statusFilter === f.key ? "#0d9488" : "#888",
                    fontWeight: 700,
                  }}
                >
                  {f.count}
                </span>
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
              whiteSpace: "nowrap",
            }}
          >
            {filtered.length} kết quả
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="adm-section" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
            Đang tải...
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
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
                  "Mã xác nhận",
                  "Nhận phòng",
                  "Trả phòng",
                  "Số đêm",
                  "Số khách",
                  "Trạng thái",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
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
                    colSpan={7}
                    style={{ padding: 60, textAlign: "center", color: "#aaa" }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                    Không tìm thấy đặt phòng nào.
                  </td>
                </tr>
              ) : (
                paginated.map((b, idx) => {
                  const sk = getStatusKey(b);
                  const sc = STATUS[sk];
                  const nights =
                    b.checkInDate && b.checkOutDate
                      ? Math.max(
                          1,
                          Math.round(
                            (new Date(b.checkOutDate) -
                              new Date(b.checkInDate)) /
                              86400000,
                          ),
                        )
                      : "—";
                  return (
                    <tr
                      key={b.id ?? b._id}
                      style={{
                        borderBottom: "1px solid #f0f2f5",
                        background: idx % 2 === 0 ? "#fff" : "#fafbfd",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0fdf4")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          idx % 2 === 0 ? "#fff" : "#fafbfd")
                      }
                    >
                      {/* Mã xác nhận */}
                      <td style={{ padding: "14px 16px" }}>
                        <code
                          style={{
                            fontWeight: 700,
                            color: "#0d9488",
                            fontSize: "0.8rem",
                            background: "#f0fdfa",
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: "1px solid #ccfbf1",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {b.bookingConfirmationCode || "—"}
                        </code>
                      </td>

                      {/* Nhận phòng */}
                      <td
                        style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                      >
                        <span style={{ color: "#1a1a2e", fontSize: "0.85rem" }}>
                          {fmtDate(b.checkInDate)}
                        </span>
                      </td>

                      {/* Trả phòng */}
                      <td
                        style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                      >
                        <span style={{ color: "#1a1a2e", fontSize: "0.85rem" }}>
                          {fmtDate(b.checkOutDate)}
                        </span>
                      </td>

                      {/* Số đêm */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span style={{ fontWeight: 600, color: "#0d9488" }}>
                          {nights}
                        </span>
                      </td>

                      {/* Số khách */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span style={{ fontWeight: 600, color: "#475569" }}>
                          {b.totalNumOfGuest ?? "—"}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            background: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: sc.dot,
                              flexShrink: 0,
                            }}
                          />
                          {sc.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/edit-booking/${b.bookingConfirmationCode}`,
                            )
                          }
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: "1.5px solid #0d9488",
                            background: "transparent",
                            color: "#0d9488",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0d9488";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#0d9488";
                          }}
                        >
                          Chi tiết →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ borderTop: "1px solid #f0f2f5", padding: "12px 0" }}>
            <Pagination
              roomsPerPage={PER_PAGE}
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

export default ManageBookingsPage;
