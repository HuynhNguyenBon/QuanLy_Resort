import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";

const PER_PAGE = 15;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
const fmtMoney = (v) =>
  v != null && v > 0 ? `$${Number(v).toLocaleString()}` : "—";

const isPaid = (b) => {
  const p = (b.paymentStatus || "").toUpperCase();
  if (p === "PAID") return true;
  const s = (b.bookingStatus || b.status || "").toLowerCase();
  return s === "confirmed" || s === "true";
};

const getAmount = (b) => {
  if (b.totalPrice != null && b.totalPrice > 0) return Number(b.totalPrice);
  if (b.room?.roomPrice && b.checkInDate && b.checkOutDate) {
    const nights = Math.max(
      1,
      Math.round(
        (new Date(b.checkOutDate) - new Date(b.checkInDate)) / 86400000,
      ),
    );
    return Number(b.room.roomPrice) * nights;
  }
  return 0;
};

const TransactionHistoryPage = () => {
  const { t } = useTranslation("adminPanel");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [markingId, setMarkingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 3500);
  };

  const handleMarkPaid = async (b) => {
    if (
      !window.confirm(
        `${t("transactions.confirmMarkPaid")} ${b.bookingConfirmationCode} ${t("transactions.confirmMarkPaidSuffix")}`,
      )
    )
      return;
    setMarkingId(b.id);
    try {
      await ApiService.updateBooking(b.id, {
        paymentStatus: "PAID",
        bookingStatus: "CONFIRMED",
      });
      setBookings((prev) =>
        prev.map((x) =>
          x.id === b.id
            ? { ...x, paymentStatus: "PAID", bookingStatus: "CONFIRMED" }
            : x,
        ),
      );
      showMsg(
        `${t("transactions.markSuccess")} ${b.bookingConfirmationCode} ${t("transactions.markSuccessSuffix")}`,
      );
    } catch (e) {
      showMsg(
        "Cập nhật thất bại: " + (e.response?.data?.message || e.message),
        false,
      );
    } finally {
      setMarkingId(null);
    }
  };

  useEffect(() => {
    ApiService.getAllBookings()
      .then((r) => setBookings(r.bookingList || r.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const transactions = bookings.map((b) => ({
    ...b,
    _paid: isPaid(b),
    _amount: getAmount(b),
    _date: b.checkInDate || b.createdAt,
  }));

  const filtered = transactions
    .filter((b) => {
      const matchSearch =
        !search ||
        (b.bookingConfirmationCode || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (b.user?.name || "").toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "paid" && b._paid) ||
        (filter === "pending" && !b._paid);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => new Date(b._date) - new Date(a._date));

  const totalRevenue = transactions
    .filter((t) => t._paid)
    .reduce((s, t) => s + t._amount, 0);
  const pendingAmount = transactions
    .filter((t) => !t._paid)
    .reduce((s, t) => s + t._amount, 0);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const FILTERS = [
    { key: "all", label: t("transactions.all"), count: transactions.length },
    {
      key: "paid",
      label: t("transactions.paid"),
      count: transactions.filter((tx) => tx._paid).length,
    },
    {
      key: "pending",
      label: t("transactions.pending"),
      count: transactions.filter((tx) => !tx._paid).length,
    },
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
          <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>💳</span>{" "}
          {t("transactions.title")}
        </h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
          {t("transactions.subtitle")}
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: t("transactions.totalRevenue"),
            value: `$${Number(totalRevenue).toLocaleString()}`,
            icon: "💰",
            color: "#0d9488",
            light: "#f0fdfa",
          },
          {
            label: t("transactions.pendingAmount"),
            value: `$${Number(pendingAmount).toLocaleString()}`,
            icon: "⏳",
            color: "#f59e0b",
            light: "#fffbeb",
          },
          {
            label: t("transactions.totalTransactions"),
            value: transactions.length,
            icon: "📄",
            color: "#6366f1",
            light: "#eef2ff",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="adm-section"
            style={{
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: s.light,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}
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

      {msg.text && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: "0.88rem",
            background: msg.ok ? "#f0fdf4" : "#fef2f2",
            color: msg.ok ? "#15803d" : "#b91c1c",
            border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          {msg.ok ? "✓" : "⚠️"} {msg.text}
        </div>
      )}

      {/* Filters */}
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
              }}
            >
              🔍
            </span>
            <input
              placeholder={t("transactions.searchPlaceholder")}
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
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
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
                  background: filter === f.key ? "#fff" : "transparent",
                  color: filter === f.key ? "#0d9488" : "#64748b",
                  fontWeight: filter === f.key ? 700 : 400,
                  boxShadow:
                    filter === f.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
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
                    background: filter === f.key ? "#f0fdfa" : "#e2e8f0",
                    color: filter === f.key ? "#0d9488" : "#888",
                    fontWeight: 700,
                  }}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
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
                  t("transactions.cols.num"),
                  t("transactions.cols.code"),
                  t("transactions.cols.guest"),
                  t("transactions.cols.room"),
                  t("transactions.cols.checkin"),
                  t("transactions.cols.checkout"),
                  t("transactions.cols.amount"),
                  t("transactions.cols.status"),
                  t("transactions.cols.actions"),
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
                    colSpan={9}
                    style={{ padding: 60, textAlign: "center", color: "#aaa" }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                    {t("transactions.noTransactions")}
                  </td>
                </tr>
              ) : (
                paginated.map((b, idx) => (
                  <tr
                    key={b.id ?? idx}
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
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(currentPage - 1) * PER_PAGE + idx + 1}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <code
                        style={{
                          fontWeight: 700,
                          color: "#0d9488",
                          fontSize: "0.8rem",
                          background: "#f0fdfa",
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #ccfbf1",
                        }}
                      >
                        {b.bookingConfirmationCode || "—"}
                      </code>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1a1a2e",
                          fontSize: "0.87rem",
                        }}
                      >
                        {b.user?.name || "—"}
                      </div>
                      {b.user?.email && (
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                          {b.user.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>
                      {b.room?.roomType || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                        color: "#475569",
                      }}
                    >
                      {fmtDate(b.checkInDate)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                        color: "#475569",
                      }}
                    >
                      {fmtDate(b.checkOutDate)}
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: b._paid ? "#0d9488" : "#f59e0b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {fmtMoney(b._amount)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          background: b._paid ? "#f0fdf4" : "#fffbeb",
                          color: b._paid ? "#15803d" : "#b45309",
                          border: `1px solid ${b._paid ? "#bbf7d0" : "#fde68a"}`,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: b._paid ? "#22c55e" : "#f59e0b",
                            flexShrink: 0,
                          }}
                        />
                        {b._paid
                          ? t("transactions.statusPaid")
                          : t("transactions.statusPending")}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td style={{ padding: "12px 16px" }}>
                      {!b._paid && (
                        <button
                          onClick={() => handleMarkPaid(b)}
                          disabled={markingId === b.id}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "none",
                            background:
                              markingId === b.id ? "#99d6d0" : "#0d9488",
                            color: "#fff",
                            cursor:
                              markingId === b.id ? "not-allowed" : "pointer",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (markingId !== b.id)
                              e.currentTarget.style.background = "#0a7c73";
                          }}
                          onMouseLeave={(e) => {
                            if (markingId !== b.id)
                              e.currentTarget.style.background = "#0d9488";
                          }}
                        >
                          {markingId === b.id
                            ? t("transactions.marking")
                            : `✓ ${t("transactions.markPaid")}`}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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

export default TransactionHistoryPage;
