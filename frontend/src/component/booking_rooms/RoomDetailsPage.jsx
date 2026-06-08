import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getRoomTranslation } from "../../data/roomTranslations";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import DatePicker from "react-datepicker";
import { useToast } from "../common/Toast";
import RoomReviews from "../common/RoomReviews";
import { useCompare } from "../common/CompareContext";
import "../../UiverseElements.css";

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
const DEFAULT_LIMIT = { maxAdults: 2, maxChildren: 2, maxTotal: 3 };
const getLimit = (roomType) => ROOM_LIMITS[roomType] || DEFAULT_LIMIT;

const DATE_FORMATS = { vi: "dd/MM/yyyy", en: "MM/dd/yyyy", ja: "yyyy/MM/dd" };
const getDateFormat = (lang) => DATE_FORMATS[lang] || "dd/MM/yyyy";

const EXCHANGE_RATES = { vi: 25000, ja: 155, en: 1 };
const formatPrice = (amountUSD, lang) => {
  const code = (lang || "en").split("-")[0];
  if (code === "vi") {
    const vnd = Math.round(amountUSD * EXCHANGE_RATES.vi);
    return `${vnd.toLocaleString("vi-VN")} VNĐ`;
  }
  if (code === "ja") {
    const jpy = Math.round(amountUSD * EXCHANGE_RATES.ja);
    return `¥${jpy.toLocaleString("ja-JP")}`;
  }
  return `$${amountUSD}`;
};

const RoomDetailsPage = () => {
  const { t, i18n } = useTranslation("rooms");
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggle, isSelected } = useCompare();

  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payNow, setPayNow] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const bookingLoadingRef = useRef(false);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const pendingPaymentBookingIdRef = useRef(null);
  const [cachedUserId, setCachedUserId] = useState(null);
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bbhh_selected_services") || "[]");
    } catch {
      return [];
    }
  });
  const [activePromo, setActivePromo] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("bbhh_active_promo") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const lang = i18n.language.split("-")[0];
        const [roomRes, transRes, profileRes] = await Promise.all([
          ApiService.getRoomById(roomId),
          ApiService.getRoomTranslation(roomId, lang).catch(() => null),
          ApiService.isAuthenticated()
            ? ApiService.getUserProfile().catch(() => null)
            : Promise.resolve(null),
        ]);

        const room = roomRes?.room || roomRes;
        if (!room) {
          setError(t("roomDetailsPage.general"));
          return;
        }

        let translatedRoom = { ...room };
        // 1. DB translation (highest priority)
        if (transRes) {
          if (transRes.roomType) translatedRoom.roomType = transRes.roomType;
          if (transRes.roomDescription)
            translatedRoom.roomDescription = transRes.roomDescription;
          if (transRes.location) translatedRoom.location = transRes.location;
        }
        // 2. Static fallback from source code
        if (!transRes || (!transRes.roomType && !transRes.roomDescription)) {
          const staticTrans = getRoomTranslation(room.roomType, lang);
          if (staticTrans) {
            if (
              !translatedRoom.roomType ||
              translatedRoom.roomType === room.roomType
            )
              translatedRoom.roomType =
                staticTrans.roomType || translatedRoom.roomType;
            if (
              !translatedRoom.roomDescription ||
              translatedRoom.roomDescription === room.roomDescription
            )
              translatedRoom.roomDescription =
                staticTrans.roomDescription || translatedRoom.roomDescription;
          }
        }

        setRoomDetails(translatedRoom);
        if (profileRes?.user?.id) setCachedUserId(profileRes.user.id);
      } catch (err) {
        console.error("Lỗi tải phòng:", err);
        setError(t("roomDetailsPage.general"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [roomId, i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const limit = roomDetails ? getLimit(roomDetails.roomType) : DEFAULT_LIMIT;
  const totalGuests = numAdults + numChildren;
  const discountPct = parseFloat(activePromo?.discount) || 0;

  let promoBase = null,
    promoSaved = null;
  if (activePromo && discountPct > 0 && totalPrice > 0) {
    promoBase = Math.round(totalPrice / (1 - discountPct / 100));
    promoSaved = promoBase - totalPrice;
  }

  const clearPromo = () => {
    sessionStorage.removeItem("bbhh_active_promo");
    setActivePromo(null);
  };

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
        t("roomDetailsPage.childrenLimitError", { count: limit.maxTotal }),
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
      const base = days * roomDetails.roomPrice;
      setTotalPrice(base - Math.round((base * discountPct) / 100));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const acceptBooking = async () => {
    if (bookingLoadingRef.current) return;
    if (!ApiService.isAuthenticated()) {
      navigate("/login", {
        state: { from: { pathname: `/room-details-book/${roomId}` } },
      });
      return;
    }

    bookingLoadingRef.current = true;
    setBookingLoading(true);
    setError("");

    try {
      let userId = cachedUserId;
      if (!userId) {
        const userProfile = await ApiService.getUserProfile();
        userId = userProfile.user.id;
        if (userId) setCachedUserId(userId);
      }
      if (!userId) {
        toast(t("roomDetailsPage.loginAgain"), "error");
        return;
      }

      const booking = {
        checkInDate: checkInDate.toISOString().split("T")[0],
        checkOutDate: checkOutDate.toISOString().split("T")[0],
        numOfAdults: numAdults,
        numOfChildren: numChildren,
        serviceIds: selectedServices.map((s) => s.id),
        ...(activePromo && {
          promoCode: activePromo.id,
          discountPercent: discountPct || null,
        }),
      };
      const bookingRes = await ApiService.bookRoom(roomId, userId, booking);
      if (bookingRes.statusCode !== 200) {
        setError(bookingRes.message);
        return;
      }

      localStorage.removeItem("bbhh_selected_services");
      clearPromo();
      setSelectedServices([]);

      if (payNow) {
        const paymentRes = await ApiService.createVNPayPayment(
          bookingRes.bookingId,
        );
        if (paymentRes.status === "OK") {
          sessionStorage.setItem("pendingBookingId", bookingRes.bookingId);
          // Mở VNPay ở tab mới và GIỮ NGUYÊN tab hiện tại (không window.location.href).
          // Lý do: nếu cùng một tab điều hướng resort -> VNPay -> resort, một số
          // trình duyệt (Safari ITP, Firefox Redirect Tracking...) coi đây là
          // "bounce tracking" và xoá sạch localStorage/sessionStorage của domain
          // resort ngay khi quay lại, khiến người dùng tự nhiên bị đăng xuất dù
          // không có đoạn code nào gọi logout(). Giữ tab gốc không rời đi thì
          // phiên đăng nhập không bao giờ bị mất.
          window.open(paymentRes.paymentUrl, "_blank", "noopener,noreferrer");
          pendingPaymentBookingIdRef.current = bookingRes.bookingId;
          setWaitingPayment(true);
        } else {
          setError(t("roomDetailsPage.paymentError") + paymentRes.message);
        }
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      bookingLoadingRef.current = false;
      setBookingLoading(false);
    }
  };

  // Khi người dùng quay lại tab này (đã hoàn tất hoặc đóng tab thanh toán VNPay),
  // kiểm tra xem đặt phòng đang chờ đã được thanh toán hay chưa.
  useEffect(() => {
    if (!waitingPayment) return;

    const checkPendingPayment = async () => {
      const bookingId = pendingPaymentBookingIdRef.current;
      if (!bookingId || !cachedUserId) return;
      try {
        const res = await ApiService.getUserBookings(cachedUserId);
        const bookings = res.user?.bookings || [];
        const match = bookings.find((b) => b.id === bookingId);
        if (!match) return;

        const paid =
          (match.paymentStatus || "").toString().toUpperCase() === "PAID";
        if (paid) {
          sessionStorage.removeItem("pendingBookingId");
          pendingPaymentBookingIdRef.current = null;
          setWaitingPayment(false);
          toast("Thanh toán thành công!", "success");
          navigate("/profile");
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái thanh toán:", err);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkPendingPayment();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkPendingPayment);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkPendingPayment);
    };
  }, [waitingPayment, cachedUserId, navigate, toast]);

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
            <div className="bbhh-details-info">
              <div className="bbhh-image-frame">
                <img
                  src={roomDetails.roomPhotoUrl}
                  alt={roomDetails.roomType}
                />
                <div className="bbhh-room-badge">{roomDetails.roomType}</div>
                <button
                  className={`bbhh-compare-toggle${isSelected(roomDetails.id) ? " active" : ""}`}
                  onClick={() => {
                    toggle(roomDetails);
                    if (!isSelected(roomDetails.id))
                      toast(
                        `Đã thêm ${roomDetails.roomType} vào danh sách so sánh`,
                        "success",
                        2500,
                      );
                  }}
                >
                  {isSelected(roomDetails.id) ? "✓ Đang so sánh" : "⇄ So sánh"}
                </button>
              </div>
              <div className="bbhh-info-text">
                <h3>{t("roomDetailsPage.roomDetails")}</h3>
                <p>
                  {roomDetails.roomDescription ||
                    t("roomDetailsPage.defaultDesc")}
                </p>
                <div className="bbhh-price-circle">
                  <span>
                    {formatPrice(roomDetails.roomPrice, i18n.language)}
                  </span>
                  {t("roomDetailsPage.night")}
                </div>
                <div className="room-limit-info">
                  <span>
                    👥{" "}
                    {t("roomDetailsPage.maxGuests", { count: limit.maxTotal })}
                  </span>
                  <span>
                    🧑{" "}
                    {t("roomDetailsPage.maxAdults", { count: limit.maxAdults })}
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

            <div className="bbhh-booking-card">
              <div className="bbhh-card-header">
                <h3>{t("roomDetailsPage.bookRoom")}</h3>
                <div className="bbhh-underline-left" />
              </div>

              {activePromo && (
                <div className="promo-active-banner">
                  <span className="promo-active-icon">🏷️</span>
                  <div>
                    <strong>{activePromo.title}</strong>
                    <span className="promo-active-discount">
                      {activePromo.discount} OFF
                    </span>
                  </div>
                  <button className="promo-active-remove" onClick={clearPromo}>
                    ✕
                  </button>
                </div>
              )}

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
                    dateFormat={getDateFormat(i18n.language)}
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
                    dateFormat={getDateFormat(i18n.language)}
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
                    {promoBase ? (
                      <span className="promo-price-original">
                        {formatPrice(promoBase, i18n.language)}
                      </span>
                    ) : (
                      <strong>{formatPrice(totalPrice, i18n.language)}</strong>
                    )}
                  </div>
                  {promoBase && (
                    <>
                      <div className="summary-row promo-discount-row">
                        <span>🏷️ {activePromo.title}:</span>
                        <strong className="promo-saved">
                          -{formatPrice(promoSaved, i18n.language)}
                        </strong>
                      </div>
                      <div className="summary-row">
                        <span>
                          {t("roomDetailsPage.roomPrice")} (sau giảm):
                        </span>
                        <strong>
                          {formatPrice(totalPrice, i18n.language)}
                        </strong>
                      </div>
                    </>
                  )}

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
                              ? formatPrice(s.price, i18n.language)
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
                      {formatPrice(
                        totalPrice +
                          selectedServices.reduce(
                            (s, sv) => s + (sv.price || 0),
                            0,
                          ),
                        i18n.language,
                      )}
                    </strong>
                  </div>

                  <div className="pay-options">
                    <label
                      className={`pay-option${payNow ? " selected" : ""}`}
                      onClick={() => setPayNow(true)}
                    >
                      <span className="pay-radio">{payNow ? "●" : "○"}</span>
                      <div>
                        <strong>{t("roomDetailsPage.payNow")}</strong>
                        <p>{t("roomDetailsPage.payNowDesc")}</p>
                      </div>
                    </label>
                    <label
                      className={`pay-option${!payNow ? " selected" : ""}`}
                      onClick={() => setPayNow(false)}
                    >
                      <span className="pay-radio">{!payNow ? "●" : "○"}</span>
                      <div>
                        <strong>{t("roomDetailsPage.bookFirst")}</strong>
                        <p>{t("roomDetailsPage.bookFirstDesc")}</p>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={acceptBooking}
                    className="bbhh-btn-confirm-final"
                    disabled={bookingLoading || waitingPayment}
                    style={{ opacity: bookingLoading || waitingPayment ? 0.75 : 1 }}
                  >
                    {bookingLoading
                      ? "⏳ Đang xử lý..."
                      : payNow
                        ? t("roomDetailsPage.payAndConfirm")
                        : t("roomDetailsPage.reserveNow")}
                  </button>

                  {waitingPayment && (
                    <div className="bbhh-payment-waiting-note">
                      <p>
                        💳 Cổng thanh toán VNPay đã mở ở một tab mới. Hãy hoàn
                        tất thanh toán ở đó, sau đó quay lại tab này — hệ thống
                        sẽ tự động kiểm tra kết quả.
                      </p>
                      <button
                        type="button"
                        className="bbhh-btn-recheck-payment"
                        onClick={async () => {
                          const bookingId = pendingPaymentBookingIdRef.current;
                          if (!bookingId || !cachedUserId) return;
                          try {
                            const res = await ApiService.getUserBookings(cachedUserId);
                            const bookings = res.user?.bookings || [];
                            const match = bookings.find((b) => b.id === bookingId);
                            const paid =
                              (match?.paymentStatus || "").toString().toUpperCase() === "PAID";
                            if (paid) {
                              sessionStorage.removeItem("pendingBookingId");
                              pendingPaymentBookingIdRef.current = null;
                              setWaitingPayment(false);
                              toast("Thanh toán thành công!", "success");
                              navigate("/profile");
                            } else {
                              toast("Chưa nhận được kết quả thanh toán. Vui lòng hoàn tất ở tab VNPay rồi thử lại.", "info");
                            }
                          } catch (err) {
                            console.error("Lỗi kiểm tra trạng thái thanh toán:", err);
                          }
                        }}
                      >
                        🔄 Tôi đã thanh toán xong — Kiểm tra lại
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {roomDetails && (
          <div className="bbhh-reviews-section">
            <RoomReviews
              roomId={roomDetails.id}
              roomType={roomDetails.roomType}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
