import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import DatePicker from "react-datepicker";
import "../../UiverseElements.css";

const RoomDetailsPage = () => {
  const { t, i18n } = useTranslation("rooms");
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);

  // ─── Fetch room + translation ───────────────────────────────────────────────
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        // 1. Lấy thông tin phòng gốc (luôn có)
        const roomRes = await ApiService.getRoomById(roomId);
        const room = roomRes?.room || roomRes;

        if (!room) {
          setError("Không tìm thấy thông tin phòng.");
          return;
        }

        // 2. Lấy bản dịch — nếu lỗi vẫn giữ dữ liệu gốc
        const lang = i18n.language.split("-")[0];
        let translatedRoom = { ...room };

        try {
          const transRes = await ApiService.getRoomTranslation(roomId, lang);
          if (transRes) {
            // Chỉ ghi đè nếu bản dịch thực sự có giá trị
            if (transRes.roomType) translatedRoom.roomType = transRes.roomType;
            if (transRes.roomDescription)
              translatedRoom.roomDescription = transRes.roomDescription;
            if (transRes.location) translatedRoom.location = transRes.location;
          }
        } catch (_) {
          // Không có bản dịch → giữ nguyên dữ liệu gốc, không crash
        }

        setRoomDetails(translatedRoom);
      } catch (err) {
        console.error("Lỗi tải phòng:", err);
        setError("Không thể tải thông tin phòng. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, i18n.language]);

  // ─── Tính giá ────────────────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setError(t("roomDetailsPage.selectDates"));
      return;
    }

    try {
      const formattedCheckInDate = checkInDate.toISOString().split("T")[0];
      const formattedCheckOutDate = checkOutDate.toISOString().split("T")[0];
      const available = await ApiService.checkRoomAvailability(
        roomId,
        formattedCheckInDate,
        formattedCheckOutDate,
      );

      if (!available) {
        setError(t("roomDetailsPage.roomBooked"));
        return;
      }

      const days = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
      );
      const total = days * roomDetails.roomPrice;

      setTotalPrice(total);
      setTotalGuests(numAdults + numChildren);
      setError("");
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === "Access denied") setError(t("roomDetailsPage.forbidden"));
      else if (message === "Room is not available for the selected dates")
        setError(t("roomDetailsPage.roomNotAvailable"));
      else if (message === "Room already booked for selected dates.")
        setError(t("roomDetailsPage.roomBooked"));
      else setError(t("roomDetailsPage.general"));
    }
  };

  // ─── Đặt phòng ───────────────────────────────────────────────────────────────
  const acceptBooking = async () => {
    try {
      const userProfile = await ApiService.getUserProfile();
      const userId = userProfile.user.id;

      if (!userId) {
        alert(t("roomDetailsPage.loginAgain"));
        return;
      }

      const booking = {
        checkInDate: checkInDate.toISOString().split("T")[0],
        checkOutDate: checkOutDate.toISOString().split("T")[0],
        numOfAdults: numAdults,
        numOfChildren: numChildren,
      };

      const bookingRes = await ApiService.bookRoom(roomId, userId, booking);
      if (bookingRes.statusCode !== 200) {
        setError(bookingRes.message);
        return;
      }

      const paymentRes = await ApiService.createVNPayPayment(
        bookingRes.bookingId,
      );
      if (paymentRes.status === "OK") {
        sessionStorage.setItem("pendingBookingId", bookingRes.bookingId);
        window.location.href = paymentRes.paymentUrl;
      } else {
        try {
          await ApiService.cancelBooking(bookingRes.bookingId);
        } catch (_) {}
        setError(t("roomDetailsPage.paymentError") + paymentRes.message);
      }
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === "Access denied") setError(t("roomDetailsPage.forbidden"));
      else if (message === "Room is not available for the selected dates")
        setError(t("roomDetailsPage.roomNotAvailable"));
      else if (message === "Room already booked for selected dates.")
        setError(t("roomDetailsPage.roomBooked"));
      else setError(t("roomDetailsPage.general"));
    }
  };

  // ─── Format giá ──────────────────────────────────────────────────────────────
  const formatPrice = (price) => {
    if (!price) return "0";
    const lang = i18n.language; // vi, ja, en...
    return Number(price).toLocaleString(lang === "vi" ? "vi-VN" : "en-US");
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="bbhh-loader-container">
        <div className="bbhh-spinner"></div>
      </div>
    );

  return (
    <div className="bbhh-details-wrapper">
      <div className="bbhh-details-container">
        {error && <p className="bbhh-error-banner">{error}</p>}

        {roomDetails ? (
          <div className="bbhh-details-grid">
            {/* ── Cột trái: Thông tin phòng ── */}
            <div className="bbhh-details-info">
              <div className="bbhh-image-frame">
                <img
                  src={roomDetails.roomPhotoUrl}
                  alt={roomDetails.roomType}
                />
                {/* Badge loại phòng — dùng bản dịch nếu có */}
                <div className="bbhh-room-badge">{roomDetails.roomType}</div>
              </div>

              <div className="bbhh-info-text">
                <h3>{t("roomDetailsPage.roomDetails")}</h3>

                {/* Tên phòng hiển thị rõ ràng */}
                <h2 className="bbhh-room-name">{roomDetails.roomType}</h2>

                {/* Địa điểm nếu có */}
                {roomDetails.location && (
                  <p className="bbhh-room-location">
                    📍 {roomDetails.location}
                  </p>
                )}

                {/* Mô tả phòng */}
                <p className="bbhh-room-description">
                  {roomDetails.roomDescription ||
                    t("roomDetailsPage.defaultDesc")}
                </p>

                <div className="bbhh-price-circle">
                  <span>
                    ${formatPrice(roomDetails.roomPrice)} /{" "}
                    {t("roomDetailsPage.night")}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Cột phải: Form đặt phòng ── */}
            <div className="bbhh-booking-card">
              <div className="bbhh-card-header">
                <h3>{t("roomDetailsPage.bookRoom")}</h3>
                <div className="bbhh-underline-left"></div>
              </div>

              <div className="bbhh-date-selection">
                <div className="bbhh-input-box">
                  <label>{t("roomDetailsPage.checkIn")}</label>
                  <DatePicker
                    id="checkin"
                    selected={checkInDate}
                    onChange={(date) => setCheckInDate(date)}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    placeholderText="Chọn ngày"
                    className="bbhh-date-input"
                    minDate={new Date()}
                  />
                </div>
                <div className="bbhh-input-box">
                  <label>{t("roomDetailsPage.checkOut")}</label>
                  <DatePicker
                    id="checkout"
                    selected={checkOutDate}
                    onChange={(date) => setCheckOutDate(date)}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate || new Date()}
                    placeholderText="Chọn ngày"
                    className="bbhh-date-input"
                  />
                </div>
              </div>

              <div className="bbhh-guest-selection">
                <div className="bbhh-input-box">
                  <label>{t("roomDetailsPage.adults")}</label>
                  <input
                    id="adults"
                    type="number"
                    min="1"
                    value={numAdults}
                    onChange={(e) =>
                      setNumAdults(parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div className="bbhh-input-box">
                  <label>{t("roomDetailsPage.children")}</label>
                  <input
                    id="children"
                    type="number"
                    min="0"
                    value={numChildren}
                    onChange={(e) =>
                      setNumChildren(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <button
                className="bbhh-btn-calculate"
                onClick={handleConfirmBooking}
              >
                {t("roomDetailsPage.checkPrice")}
              </button>

              {totalPrice > 0 && (
                <div className="bbhh-summary-box">
                  <div className="summary-row">
                    <span>{t("roomDetailsPage.guests")}:</span>
                    <strong>{totalGuests}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{t("roomDetailsPage.total")}:</span>
                    <strong className="text-orange">
                      ${formatPrice(totalPrice)}
                    </strong>
                  </div>
                  <button
                    onClick={acceptBooking}
                    className="bbhh-btn-confirm-final"
                  >
                    {t("roomDetailsPage.confirm")}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          !error && (
            <div className="ar-empty">
              <p>Không tìm thấy thông tin phòng.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
