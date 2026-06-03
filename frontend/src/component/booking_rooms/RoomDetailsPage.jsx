import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
        if (transRes) {
          if (transRes.roomType) translatedRoom.roomType = transRes.roomType;
          if (transRes.roomDescription)
            translatedRoom.roomDescription = transRes.roomDescription;
          if (transRes.location) translatedRoom.location = transRes.location;
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
          window.location.href = paymentRes.paymentUrl;
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
                  <span>{roomDetails.roomPrice}</span>
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
                      <span className="promo-price-original">${promoBase}</span>
                    ) : (
                      <strong>${totalPrice}</strong>
                    )}
                  </div>
                  {promoBase && (
                    <>
                      <div className="summary-row promo-discount-row">
                        <span>🏷️ {activePromo.title}:</span>
                        <strong className="promo-saved">-${promoSaved}</strong>
                      </div>
                      <div className="summary-row">
                        <span>
                          {t("roomDetailsPage.roomPrice")} (sau giảm):
                        </span>
                        <strong>${totalPrice}</strong>
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
                    disabled={bookingLoading}
                    style={{ opacity: bookingLoading ? 0.75 : 1 }}
                  >
                    {bookingLoading
                      ? "⏳ Đang xử lý..."
                      : payNow
                        ? t("roomDetailsPage.payAndConfirm")
                        : t("roomDetailsPage.reserveNow")}
                  </button>
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
