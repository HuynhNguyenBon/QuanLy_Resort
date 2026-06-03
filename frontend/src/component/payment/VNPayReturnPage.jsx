import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/ApiService";

const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "linear-gradient(145deg, #0f2027 0%, #203a43 50%, #2c5364 100%)";
    return () => { document.body.style.background = prev; };
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = {};
        searchParams.forEach((value, key) => { params[key] = value; });

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="vp-page">
      <div className="vp-card">
        <div className="vp-card-header vp-header-loading">
          <div className="vp-loading-anim">
            <div className="vp-ring" />
            <div className="vp-ring vp-ring-2" />
          </div>
          <div className="vp-hotel-brand">⭐ BBHH Resort</div>
        </div>
        <div className="vp-card-body">
          <p className="vp-loading-text">Đang xác minh thanh toán…</p>
          <p className="vp-loading-sub">Vui lòng không đóng trình duyệt</p>
        </div>
      </div>
    </div>
  );

  const isSuccess = result?.status === "SUCCESS";

  return (
    <div className="vp-page">
      <div className="vp-card">

        {/* Colored header section */}
        <div className={`vp-card-header ${isSuccess ? "vp-header-success" : "vp-header-fail"}`}>
          <div className="vp-hotel-brand">⭐ BBHH Resort</div>
          <div className="vp-main-icon">
            {isSuccess ? (
              <svg viewBox="0 0 52 52" className="vp-check-svg">
                <circle className="vp-check-circle" cx="26" cy="26" r="24" />
                <path className="vp-check-tick" d="M14 27 l8 8 l16-16" />
              </svg>
            ) : (
              <div className="vp-x-circle">
                <span>✕</span>
              </div>
            )}
          </div>
          <h2 className="vp-header-title">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </h2>
        </div>

        {/* Body */}
        <div className="vp-card-body">
          <p className="vp-msg">{result?.message}</p>

          {isSuccess && (
            <div className="vp-info-box">
              <div className="vp-info-row">
                <span className="vp-info-label">📋 Mã đặt phòng</span>
                <strong className="vp-info-val vp-code">{result?.bookingConfirmationCode}</strong>
              </div>
              <div className="vp-info-row">
                <span className="vp-info-label">💳 Mã giao dịch</span>
                <strong className="vp-info-val">{result?.transactionId}</strong>
              </div>
              <div className="vp-info-note">
                📧 Email xác nhận đã được gửi đến hộp thư của bạn
              </div>
            </div>
          )}

          {!isSuccess && (
            <div className="vp-fail-hint">
              <p>💡 <strong>Nguyên nhân phổ biến:</strong></p>
              <ul>
                <li>Số dư tài khoản không đủ</li>
                <li>Thẻ bị từ chối hoặc hết hạn</li>
                <li>Quá thời gian xác nhận</li>
              </ul>
            </div>
          )}

          <div className="vp-btns">
            {isSuccess ? (
              <button className="vp-btn-primary" onClick={() => navigate("/profile")}>
                📋 Xem lịch sử đặt phòng
              </button>
            ) : (
              <button className="vp-btn-danger" onClick={() => navigate("/rooms")}>
                🔄 Thử lại
              </button>
            )}
            <button className="vp-btn-ghost" onClick={() => navigate("/home")}>
              🏠 Về trang chủ
            </button>
          </div>

          {isSuccess && (
            <div className="vp-footer-note">
              Chúng tôi rất mong được chào đón bạn tại BBHH Resort! 🌟
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;