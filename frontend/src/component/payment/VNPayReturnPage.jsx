import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/ApiService";

const VNPayReturnPage = () => {
  const { t } = useTranslation("payment");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Chuyển tất cả query params thành object
        const params = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        const response = await ApiService.getVNPayReturn(params);
        setResult(response);

        // Nếu thanh toán thất bại, xóa booking đã tạo
        if (response?.status !== "SUCCESS") {
          const pendingBookingId = sessionStorage.getItem("pendingBookingId");
          if (pendingBookingId) {
            try {
              await ApiService.cancelBooking(pendingBookingId);
              console.log("Cancelled pending booking:", pendingBookingId);
            } catch (cancelError) {
              console.error("Error canceling pending booking:", cancelError);
            }
            sessionStorage.removeItem("pendingBookingId");
          }
        } else {
          // Thanh toán thành công - clear pending booking ID
          sessionStorage.removeItem("pendingBookingId");
        }
      } catch (err) {
        setResult({ status: "ERROR", message: err.message });
        // Cũng xóa booking nếu có lỗi xác minh
        const pendingBookingId = sessionStorage.getItem("pendingBookingId");
        if (pendingBookingId) {
          try {
            await ApiService.cancelBooking(pendingBookingId);
          } catch (cancelError) {
            console.error("Error canceling pending booking:", cancelError);
          }
          sessionStorage.removeItem("pendingBookingId");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (loading)
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner}></div>
          <p>{t("vnpayReturnPage.verifying")}</p>
        </div>
      </div>
    );

  const isSuccess = result?.status === "SUCCESS";

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.card,
          borderTop: `4px solid ${isSuccess ? "#22c55e" : "#ef4444"}`,
        }}
      >
        <div style={styles.iconWrap}>
          {isSuccess ? (
            <span
              style={{
                ...styles.icon,
                background: "#dcfce7",
                color: "#16a34a",
              }}
            >
              ✓
            </span>
          ) : (
            <span
              style={{
                ...styles.icon,
                background: "#fee2e2",
                color: "#dc2626",
              }}
            >
              ✗
            </span>
          )}
        </div>

        <h2
          style={{ color: isSuccess ? "#16a34a" : "#dc2626", margin: "12px 0" }}
        >
          {isSuccess
            ? t("vnpayReturnPage.successTitle")
            : t("vnpayReturnPage.failedTitle")}
        </h2>

        <p style={styles.message}>{result?.message}</p>

        {isSuccess && (
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span>{t("vnpayReturnPage.bookingCode")}:</span>
              <strong>{result?.bookingConfirmationCode}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>{t("vnpayReturnPage.transactionId")}:</span>
              <strong>{result?.transactionId}</strong>
            </div>
          </div>
        )}

        <div style={styles.btnGroup}>
          {isSuccess ? (
            <button
              style={styles.btnPrimary}
              onClick={() => navigate("/profile")}
            >
              {t("vnpayReturnPage.viewBookings")}
            </button>
          ) : (
            <button style={styles.btnDanger} onClick={() => navigate("/rooms")}>
              {t("vnpayReturnPage.tryAgain")}
            </button>
          )}
          <button style={styles.btnSecondary} onClick={() => navigate("/home")}>
            {t("vnpayReturnPage.goHome")}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "48px 40px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  iconWrap: { display: "flex", justifyContent: "center", marginBottom: "8px" },
  icon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
  },
  message: { color: "#6b7280", marginBottom: "24px" },
  infoBox: {
    background: "#f0fdf4",
    borderRadius: "10px",
    padding: "16px 20px",
    marginBottom: "28px",
    textAlign: "left",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #dcfce7",
    fontSize: "14px",
    color: "#374151",
  },
  btnGroup: { display: "flex", gap: "12px", justifyContent: "center" },
  btnPrimary: {
    padding: "12px 24px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  btnDanger: {
    padding: "12px 24px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  btnSecondary: {
    padding: "12px 24px",
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default VNPayReturnPage;
