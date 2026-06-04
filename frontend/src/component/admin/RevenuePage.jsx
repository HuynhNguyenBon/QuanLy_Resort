import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";

const fmt = (n) => new Intl.NumberFormat().format(Math.round(n));

// Dùng cùng logic với ManageBookingsPage
const isPaid = (b) => {
  const p = (b.paymentStatus || "").toUpperCase();
  if (p === "PAID") return true;
  const s = (b.bookingStatus || b.status || "").toLowerCase();
  return s === "confirmed" || s === "true" || s === "1";
};

// Tính giá trị booking (totalPrice hoặc roomPrice × số đêm)
const getRevenue = (b) => {
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

const RevenuePage = () => {
  const { t } = useTranslation("adminPanel");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    ApiService.getAllBookings()
      .then((r) => setBookings(r.bookingList || r.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const inPeriod = (b) => {
    const d = new Date(b.checkInDate || b.createdAt);
    if (isNaN(d)) return false;
    if (period === "week") {
      const week = new Date(now);
      week.setDate(now.getDate() - 7);
      return d >= week;
    }
    if (period === "month")
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    if (period === "year") return d.getFullYear() === now.getFullYear();
    return true;
  };

  const paid = bookings.filter(isPaid);
  const periodPaid = bookings.filter((b) => inPeriod(b) && isPaid(b));

  const totalRevenue = paid.reduce((s, b) => s + getRevenue(b), 0);
  const periodRevenue = periodPaid.reduce((s, b) => s + getRevenue(b), 0);

  // Doanh thu theo tháng (12 tháng gần nhất)
  const monthlyMap = {};
  paid.forEach((b) => {
    const d = new Date(b.checkInDate || b.createdAt);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + getRevenue(b);
  });
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const maxMonthly = Math.max(...months.map((m) => monthlyMap[m] || 0), 1);

  // Doanh thu theo loại phòng
  const typeMap = {};
  paid.forEach((b) => {
    const t = b.room?.roomType || b.roomType || "Khác";
    typeMap[t] = (typeMap[t] || 0) + getRevenue(b);
  });
  const typeList = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const PERIOD_LABELS = {
    week: t("revenue.week"),
    month: t("revenue.month"),
    year: t("revenue.year"),
    all: t("revenue.all"),
  };
  const statCards = [
    {
      label: t("revenue.totalRevenue"),
      value: `$${fmt(totalRevenue)}`,
      sub: `${paid.length} ${t("revenue.paidBookings")}`,
      color: "#0d9488",
      icon: "💰",
    },
    {
      label: `${t("revenue.periodRevenue")} ${PERIOD_LABELS[period]}`,
      value: `$${fmt(periodRevenue)}`,
      sub: `${periodPaid.length} ${t("revenue.paidBookings")}`,
      color: "#6366f1",
      icon: "📈",
    },
    {
      label: t("revenue.totalBookings"),
      value: bookings.length,
      sub: `${paid.length} ${t("revenue.paidBookings")}`,
      color: "#f59e0b",
      icon: "📋",
    },
    {
      label: t("revenue.pendingBookings"),
      value: bookings.length - paid.length,
      sub: t("revenue.pendingDesc"),
      color: "#e74c3c",
      icon: "⏳",
    },
  ];

  return (
    <div className="adm-dashboard">
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>📊</span>{" "}
            {t("revenue.title")}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
            Thống kê tài chính từ đặt phòng
          </p>
        </div>

        {/* Period picker */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "#f1f5f9",
            borderRadius: 10,
            padding: 4,
          }}
        >
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "none",
                background: period === key ? "#fff" : "transparent",
                color: period === key ? "#0d9488" : "#888",
                fontWeight: period === key ? 700 : 400,
                cursor: "pointer",
                fontSize: "0.83rem",
                boxShadow:
                  period === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          {t("revenue.loading")}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {statCards.map((s) => (
              <div
                key={s.label}
                className="adm-section"
                style={{ padding: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: s.color,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: s.color,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "#1a1a2e",
                    fontSize: "0.85rem",
                    marginBottom: 2,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ color: "#aaa", fontSize: "0.78rem" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart: doanh thu 12 tháng */}
          <div
            className="adm-section"
            style={{ padding: 24, marginBottom: 20 }}
          >
            <h3
              style={{
                margin: "0 0 20px",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#1a1a2e",
              }}
            >
              {t("revenue.chartTitle")}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                height: 160,
              }}
            >
              {months.map((m) => {
                const val = monthlyMap[m] || 0;
                const h = Math.max((val / maxMonthly) * 140, val > 0 ? 4 : 0);
                const isCurrentMonth =
                  m ===
                  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                const [year, mon] = m.split("-");
                return (
                  <div
                    key={m}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      title={`$${fmt(val)}`}
                      style={{
                        width: "100%",
                        height: h,
                        borderRadius: "4px 4px 0 0",
                        background: isCurrentMonth ? "#0d9488" : "#c7f0eb",
                        transition: "height 0.3s",
                        minHeight: val > 0 ? 4 : 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: isCurrentMonth ? "#0d9488" : "#aaa",
                        fontWeight: isCurrentMonth ? 700 : 400,
                      }}
                    >
                      T{mon}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "flex-end",
                gap: 16,
                fontSize: "0.78rem",
                color: "#aaa",
              }}
            >
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#0d9488",
                    marginRight: 4,
                  }}
                />
                {t("revenue.currentMonth")}
              </span>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#c7f0eb",
                    marginRight: 4,
                  }}
                />
                {t("revenue.prevMonth")}
              </span>
            </div>
          </div>

          {/* Room type revenue */}
          {typeList.length > 0 && (
            <div className="adm-section" style={{ padding: 24 }}>
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#1a1a2e",
                }}
              >
                {t("revenue.byRoomType")}
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {typeList.map(([type, rev], i) => (
                  <div key={type}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.87rem",
                          fontWeight: 600,
                          color: "#1a1a2e",
                        }}
                      >
                        {type}
                      </span>
                      <span
                        style={{
                          fontSize: "0.87rem",
                          fontWeight: 700,
                          color: "#0d9488",
                        }}
                      >
                        ${fmt(rev)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#f0f2f5",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          background:
                            i === 0
                              ? "#0d9488"
                              : i === 1
                                ? "#6366f1"
                                : i === 2
                                  ? "#f59e0b"
                                  : "#94a3b8",
                          width: `${(rev / typeList[0][1]) * 100}%`,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RevenuePage;
