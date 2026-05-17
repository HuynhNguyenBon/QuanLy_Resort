import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import DatePicker from "react-datepicker";
import "../../UiverseElements.css";

const RoomDetailsPage = () => {
  const { t, i18n } = useTranslation("rooms");
  const getDateFormat = () => {
    switch (i18n.language) {
      case "vi":
        return "dd/MM/yyyy";

      case "en":
        return "MM/dd/yyyy";

      case "ja":
        return "yyyy/MM/dd";

      default:
        return "dd/MM/yyyy";
    }
  };
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [payNow, setPayNow] = useState(true); // true=thanh toán ngay, false=đặt trước
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bbhh_selected_services") || "[]");
    } catch {
      return [];
    }
  });
  // Giới hạn khách theo loại phòng
  const ROOM_LIMITS = {
    Standard: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
    Superior: { maxAdults: 2, maxChildren: 2, maxTotal: 3 },
    Deluxe: { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
    Suite: { maxAdults: 4, maxChildren: 3, maxTotal: 5 },
    Family: { maxAdults: 4, maxChildren: 4, maxTotal: 6 },
    King: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
    Queen: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
    Studio: { maxAdults: 2, maxChildren: 1, maxTotal: 2 },
    Executive: { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
    Presidential: { maxAdults: 6, maxChildren: 4, maxTotal: 8 },
    Precidential: { maxAdults: 6, maxChildren: 4, maxTotal: 8 },
    Bali: { maxAdults: 3, maxChildren: 2, maxTotal: 4 },
  };

  const getLimit = (roomType) => {
    return (
      ROOM_LIMITS[roomType] || { maxAdults: 2, maxChildren: 2, maxTotal: 3 }
    );
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        // 1. Lấy thông tin phòng gốc (luôn có)
        const roomRes = await ApiService.getRoomById(roomId);
        const room = roomRes?.room || roomRes;

        if (!room) {
          setError(t("roomDetailsPage.general"));
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
        setError(t("roomDetailsPage.general"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, i18n.language]);

  const limit = roomDetails
    ? getLimit(roomDetails.roomType)
    : { maxAdults: 2, maxChildren: 2, maxTotal: 3 };

  const handleAdultsChange = (val) => {
    const n = Math.max(1, Math.min(val, limit.maxAdults));
    if (n + numChildren > limit.maxTotal) {
      setError(
        t("roomDetailsPage.maxGuestError", {
          count: limit.maxTotal,
          roomType: roomDetails?.roomType,
        }),
      );
      setTimeout(() => setError(""), 4000);
      return;
    }
    setNumAdults(n);
    setError("");
  };

  const handleChildrenChange = (val) => {
    const n = Math.max(0, Math.min(val, limit.maxChildren));
    if (numAdults + n > limit.maxTotal) {
      setError(
        t("roomDetailsPage.childrenLimitError", {
          count: limit.maxTotal,
        }),
      );
      setTimeout(() => setError(""), 4000);
      return;
    }
    setNumChildren(n);
    setError("");
  };

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setError(t("roomDetailsPage.selectDates"));
      return;
    }
    try {
      const ci = checkInDate.toISOString().split("T")[0];
      const co = checkOutDate.toISOString().split("T")[0];
      const available = await ApiService.checkRoomAvailability(roomId, ci, co);
      if (!available) {
        setError(t("roomDetailsPage.roomBooked"));
        return;
      }
      const days = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
      );
      setTotalPrice(days * roomDetails.roomPrice);
      setTotalGuests(numAdults + numChildren);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const acceptBooking = async () => {
    if (!ApiService.isAuthenticated()) {
      navigate("/login", {
        state: { from: { pathname: `/room-details-book/${roomId}` } },
      });
      return;
    }
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
        serviceIds: selectedServices.map((s) => s.id),
      };
      const bookingRes = await ApiService.bookRoom(roomId, userId, booking);
      if (bookingRes.statusCode !== 200) {
        setError(bookingRes.message);
        return;
      }

      // Xóa dịch vụ khỏi cart sau khi đặt phòng thành công
      localStorage.removeItem("bbhh_selected_services");
      setSelectedServices([]);

      if (payNow) {
        // Thanh toán ngay qua VNPay
        const paymentRes = await ApiService.createVNPayPayment(
          bookingRes.bookingId,
        );
        if (paymentRes.status === "OK") {
          window.location.href = paymentRes.paymentUrl;
        } else {
          setError(t("roomDetailsPage.paymentError") + paymentRes.message);
        }
      } else {
        // Đặt trước — không cần thanh toán ngay
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (isLoading)
    return (
      <div className="bbhh-loader-container">
        <div className="bbhh-spinner" />
      </div>
    );

  return (
    <div className="bbhh-details-wrapper">
      <div className="bbhh-details-container">
        {error && <div className="bbhh-error-banner">⚠️ {error}</div>}

        {roomDetails && (
          <div className="bbhh-details-grid">
            {/* Cột trái: Ảnh + Thông tin */}
            <div className="bbhh-details-info">
              <div className="bbhh-image-frame">
                <img
                  src={roomDetails.roomPhotoUrl}
                  alt={roomDetails.roomType}
                />
                <div className="bbhh-room-badge">{roomDetails.roomType}</div>
              </div>
              <div className="bbhh-info-text">
                <h3>{t("roomDetailsPage.roomDetails")}</h3>
                <p>
                  {roomDetails.roomDescription ||
                    t("roomDetailsPage.defaultDesc")}
                </p>
                <div className="bbhh-price-circle">
                  <span>{roomDetails.roomPrice}</span>
                  {t("roomDetailsPage.night")}
                </div>
                {/* Thông tin giới hạn khách */}
                <div className="room-limit-info">
                  <span>
                    👥{" "}
                    {t("roomDetailsPage.maxGuests", {
                      count: limit.maxTotal,
                    })}
                  </span>

                  <span>
                    🧑{" "}
                    {t("roomDetailsPage.maxAdults", {
                      count: limit.maxAdults,
                    })}
                  </span>

                  <span>
                    👶{" "}
                    {t("roomDetailsPage.maxChildren", {
                      count: limit.maxChildren,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Form đặt */}
            <div className="bbhh-booking-card">
              <div className="bbhh-card-header">
                <h3>{t("roomDetailsPage.bookRoom")}</h3>
                <div className="bbhh-underline-left" />
              </div>

              <div className="bbhh-date-selection">
                <div className="bbhh-input-box">
                  <label>{t("roomDetailsPage.checkIn")}</label>
                  <DatePicker
                    selected={checkInDate}
                    onChange={setCheckInDate}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={new Date()}
                    dateFormat={getDateFormat()}
                    placeholderText={t("roomDetailsPage.selectCheckIn")}
                    className="bbhh-date-input"
                  />
                </div>
                <div className="bbhh-input-box">
                  <label>{t("roomDetailsPage.checkOut")}</label>
                  <DatePicker
                    selected={checkOutDate}
                    onChange={setCheckOutDate}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate || new Date()}
                    dateFormat={getDateFormat()}
                    placeholderText={t("roomDetailsPage.selectCheckOut")}
                    className="bbhh-date-input"
                  />
                </div>
              </div>

              <div className="bbhh-guest-selection">
                <div className="bbhh-input-box">
                  <label>
                    {t("roomDetailsPage.adults")}{" "}
                    <span className="room-limit-badge">
                      {t("roomDetailsPage.maxAdults", {
                        count: limit.maxAdults,
                      })}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={limit.maxAdults}
                    value={numAdults}
                    onChange={(e) =>
                      handleAdultsChange(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="bbhh-input-box">
                  <label>
                    {t("roomDetailsPage.children")}{" "}
                    <span className="room-limit-badge">
                      {t("roomDetailsPage.maxChildren", {
                        count: limit.maxChildren,
                      })}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={limit.maxChildren}
                    value={numChildren}
                    onChange={(e) =>
                      handleChildrenChange(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              {/* Cảnh báo nếu chỉ có trẻ em */}
              {numAdults === 0 && numChildren > 0 && (
                <div className="room-warning">
                  {t("roomDetailsPage.needAdultWarning")}
                </div>
              )}

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
                    <strong>{totalGuests} người</strong>
                  </div>
                  <div className="summary-row">
                    <span>{t("roomDetailsPage.roomPrice")}:</span>
                    <strong>{totalPrice}</strong>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="sv-booking-services">
                      <div className="sv-booking-services-title">
                        🛎️{" "}
                        {t("roomDetailsPage.includedServices", {
                          count: selectedServices.length,
                        })}
                      </div>
                      {selectedServices.map((s) => (
                        <div key={s.id} className="sv-booking-service-row">
                          <span>{s.name}</span>
                          <span>
                            {s.price
                              ? `$${s.price}`
                              : t("roomDetailsPage.free")}
                          </span>
                        </div>
                      ))}
                      <button
                        className="sv-booking-edit-services"
                        onClick={() => navigate("/services")}
                      >
                        ✎ {t("roomDetailsPage.editServices")}
                      </button>
                    </div>
                  )}

                  <div className="summary-row summary-total-row">
                    <span>{t("roomDetailsPage.total")}:</span>
                    <strong className="text-orange">
                      $
                      {totalPrice +
                        selectedServices.reduce(
                          (s, sv) => s + (sv.price || 0),
                          0,
                        )}
                    </strong>
                  </div>

                  {/* Chọn phương thức */}
                  <div className="pay-options">
                    <label
                      className={`pay-option${payNow ? " selected" : ""}`}
                      onClick={() => setPayNow(true)}
                    >
                      <span className="pay-radio">{payNow ? "●" : "○"}</span>
                      <div>
                        <strong>{t("roomDetailsPage.payNow")}</strong>
                        <p>{t("roomDetailsPage.payNowDescription")}</p>
                      </div>
                    </label>
                    <label
                      className={`pay-option${!payNow ? " selected" : ""}`}
                      onClick={() => setPayNow(false)}
                    >
                      <span className="pay-radio">{!payNow ? "●" : "○"}</span>
                      <div>
                        <strong>{t("roomDetailsPage.prebook")}</strong>
                        <p>{t("roomDetailsPage.prebookDescription")}</p>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={acceptBooking}
                    className="bbhh-btn-confirm-final"
                  >
                    {payNow
                      ? t("roomDetailsPage.payNowButton")
                      : t("roomDetailsPage.prebookButton")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
