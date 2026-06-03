import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { formatPrice } from "../../utils/formatPrice";
import {
  STATIC_SERVICES,
  IMAGE_MAP,
  EMOJI_MAP,
  mergeServices,
} from "../../data/staticServices";
import "../../UiverseElements.css";

// Tên & mô tả tiếng Việt cho các dịch vụ lấy từ API (override)
const VI_MAP = {
  "Airport Shuttle Service": {
    name: "Đưa Đón Sân Bay",
    description:
      "Đưa đón sân bay bằng xe sang, đúng giờ, phục vụ 24/7. Đặt trước ít nhất 6 giờ.",
  },
  "Gourmet Breakfast": {
    name: "Buffet Sáng Quốc Tế",
    description:
      "Buffet sáng hơn 40 món tươi ngon mỗi ngày. Phục vụ từ 6:30 – 10:30.",
  },
  "Infinity Swimming Pool": {
    name: "Hồ Bơi Vô Cực",
    description:
      "Thuê riêng hồ bơi vô cực tầng thượng. Kèm đồ uống và ghế nằm VIP.",
  },
  "Modern Fitness Center": {
    name: "Phòng Tập Hiện Đại",
    description:
      "Thiết bị tập luyện tiên tiến, mở cửa 5:00 – 23:00. PT riêng theo yêu cầu.",
  },
  "Spa & Wellness Center": {
    name: "Spa & Chăm Sóc Sức Khỏe",
    description:
      "Liệu trình thư giãn cao cấp giúp phục hồi năng lượng toàn diện.",
  },
  "Laundry & Dry Cleaning": {
    name: "Giặt Ủi & Giặt Khô",
    description:
      "Giặt ủi chuyên nghiệp, trả trong 24 giờ. Dịch vụ giặt khô theo yêu cầu.",
  },
  "Luxury Mini Bar": {
    name: "Mini Bar Cao Cấp",
    description:
      "Rượu vang, cocktail, nước trái cây tươi và đồ ăn nhẹ cao cấp trong phòng.",
  },
  "Room Service 24/7": {
    name: "Phục Vụ Phòng 24/7",
    description: "Ăn uống tận phòng bất kỳ lúc nào với thực đơn Á–Âu đa dạng.",
  },
  "Private Pool Access": {
    name: "Hồ Bơi Riêng Tư",
    description:
      "Thuê riêng hồ bơi vô cực tầng thượng 2 giờ. Kèm đồ uống và ghế nằm VIP.",
  },
};

const getViName = (service) => VI_MAP[service.name]?.name || service.name;
const getViDesc = (service) =>
  VI_MAP[service.name]?.description || service.description;

// Map highlight param → keyword to search in service name
const HIGHLIGHT_MAP = {
  pool: "pool",
  spa: "spa",
  miniBar: "mini bar",
  gym: "fitness",
};

const CART_KEY = "bbhh_selected_services";

const getEmoji = (service) => service.emoji || EMOJI_MAP[service.name] || "🛎️";

const getImage = (name) => IMAGE_MAP[name] || null;

const ServicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation("services");
  const lang = i18n.language.split("-")[0];
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  const highlightRef = useRef(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ApiService.getAllServices();
        const apiList = response.serviceList || response || [];
        setServices(mergeServices(apiList));
      } catch {
        setServices(STATIC_SERVICES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Scroll đến dịch vụ được highlight từ URL param
  useEffect(() => {
    if (isLoading || services.length === 0) return;
    const param = searchParams.get("highlight");
    if (!param) return;
    const keyword = HIGHLIGHT_MAP[param];
    if (!keyword) return;
    const matched = services.find((s) =>
      s.name.toLowerCase().includes(keyword),
    );
    if (matched) {
      setHighlightId(matched.id);
      setTimeout(() => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 150);
    }
  }, [isLoading, services]); // eslint-disable-line react-hooks/exhaustive-deps

  const isInCart = (id) => cart.some((s) => s.id === id);

  const toggleCart = (service) => {
    if (isInCart(service.id)) {
      setCart((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      setCart((prev) => [
        ...prev,
        { id: service.id, name: service.name, price: service.price },
      ]);
      setAddedId(service.id);
      setTimeout(() => setAddedId(null), 1000);
    }
  };

  const cartTotal = cart.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="sv-page">
      {/* ── HERO ── */}
      <div className="sv-hero">
        <div className="sv-hero-inner">
          <p className="sv-hero-tag">{t("servicePage.heroTag")}</p>
          <h1 className="sv-hero-h1">
            {t("servicePage.heroTitle1")}{" "}
            <span className="accent">{t("servicePage.heroAccent")}</span>
            <br />
            {t("servicePage.heroTitle2")}
          </h1>
          <p className="sv-hero-sub">{t("servicePage.heroSub")}</p>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div className="sv-body">
        <div className="sv-inner">
          {isLoading ? (
            <div className="ar-loading">
              <div className="bbhh-spinner" />
              <p>{t("servicePage.loading")}</p>
            </div>
          ) : (
            <div className="sv-grid">
              {services.map((service) => {
                const inCart = isInCart(service.id);
                const justAdd = addedId === service.id;
                const imgFile = getImage(service.name);
                const isHighlighted = highlightId === service.id;
                return (
                  <div
                    key={service.id}
                    ref={isHighlighted ? highlightRef : null}
                    className={`sv-card${inCart ? " sv-card-selected" : ""}${isHighlighted ? " sv-card-highlighted" : ""}`}
                  >
                    <div className="sv-card-img">
                      {imgFile ? (
                        <img
                          src={`./assets/images/${imgFile}`}
                          alt={service.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.querySelector(
                              ".sv-card-emoji",
                            ).style.display = "block";
                          }}
                        />
                      ) : null}
                      <span
                        className="sv-card-emoji"
                        style={{ display: imgFile ? "none" : "block" }}
                      >
                        {getEmoji(service)}
                      </span>
                    </div>
                    <div className="sv-card-body">
                      <h3 className="sv-card-title">
                        {t(
                          `servicePage.services.${service.name}.name`,
                          getViName(service),
                        )}
                      </h3>
                      <p className="sv-card-desc">
                        {t(
                          `servicePage.services.${service.name}.description`,
                          getViDesc(service),
                        )}
                      </p>
                      <div className="sv-card-footer">
                        <span className="sv-price">
                          {!service.price || service.price === 0
                            ? "Miễn phí"
                            : `${t("servicePage.from")} ${formatPrice(service.price, lang)}`}
                        </span>
                        <button
                          className={`sv-add-btn${inCart ? " sv-add-btn-added" : ""}`}
                          onClick={() => toggleCart(service)}
                        >
                          {justAdd
                            ? t("servicePage.added")
                            : inCart
                              ? t("servicePage.selectedRemove")
                              : t("servicePage.addToBooking")}
                        </button>
                      </div>
                    </div>
                    {inCart && <div className="sv-card-check">✓</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="sv-cta-section">
        <div className="sv-cta-box">
          <h2 className="sv-cta-h2">{t("servicePage.ctaTitle")}</h2>
          <p className="sv-cta-sub">{t("servicePage.ctaSub")}</p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn-gold" onClick={() => navigate("/rooms")}>
              🛏️ {t("servicePage.bookNow")}
            </button>
            <button
              className="btn-ghost-dark"
              onClick={() => navigate("/find-booking")}
            >
              🔍 {t("servicePage.findBooking")}
            </button>
          </div>
        </div>
      </div>

      {/* ── FLOATING CART ── */}
      {cart.length > 0 && (
        <div className="sv-float-cart">
          <div className="sv-float-cart-info">
            <span className="sv-float-cart-count">{cart.length}</span>
            <div>
              <div className="sv-float-cart-label">
                {t("servicePage.selectedServices")}
              </div>
              {cartTotal > 0 && (
                <div className="sv-float-cart-total">
                  +{formatPrice(cartTotal, lang)} {t("servicePage.serviceFee")}
                </div>
              )}
            </div>
          </div>
          <div className="sv-float-cart-actions">
            <button className="sv-float-cart-clear" onClick={() => setCart([])}>
              {t("servicePage.clearAll")}
            </button>
            <button
              className="sv-float-cart-book"
              onClick={() => navigate("/rooms")}
            >
              {t("servicePage.chooseRoom")} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;