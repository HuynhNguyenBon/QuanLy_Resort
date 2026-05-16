import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const IMAGE_MAP = {
  "High-Speed Wi-Fi":       "wifi.png",
  "Air Conditioning":       "ac.png",
  "Luxury Mini Bar":        "mini-bar.png",
  "Gourmet Breakfast":      "breakfast.png",
  "Infinity Swimming Pool": "pool.png",
  "Spa & Wellness Center":  "spa.png",
  "Airport Shuttle Service":"airport-transfer.png",
  "Modern Fitness Center":  "gym.png",
  "Laundry & Dry Cleaning": "laundry.png",
  "Room Service 24/7":      "room-service.png",
  "Secure Parking":         "parking.png",
};

// Data tĩnh fallback khi chưa đăng nhập / API lỗi
const STATIC_SERVICES = [
  { id: 1,  name: "Hồ bơi vô cực",        icon: "🏊", price: null,  description: "Hồ bơi tràn bờ view mở, mở cửa 6:00–22:00. Tận hưởng không gian thư giãn ngay giữa thiên nhiên." },
  { id: 2,  name: "Spa & Massage",          icon: "💆", price: 50,    description: "Liệu trình massage chuyên sâu, trị liệu bằng tinh dầu thiên nhiên. Phục hồi năng lượng sau những ngày dài." },
  { id: 3,  name: "Nhà hàng & Ẩm thực",    icon: "🍽️", price: null,  description: "Thực đơn phong phú Á–Âu, nguyên liệu tươi mỗi ngày. Phục vụ từ bữa sáng đến khuya." },
  { id: 4,  name: "Phòng gym hiện đại",     icon: "🏋️", price: null,  description: "Thiết bị cao cấp, PT riêng theo yêu cầu. Mở cửa 5:00–23:00 hàng ngày." },
  { id: 5,  name: "Đón – tiễn sân bay",    icon: "🚗", price: 30,    description: "Xe sang, đúng giờ, đặt trước 24h. Phục vụ tất cả các chuyến bay quốc tế và nội địa." },
  { id: 6,  name: "Concierge 24/7",         icon: "🛎️", price: null,  description: "Hỗ trợ mọi yêu cầu bất cứ lúc nào — đặt tour, nhà hàng, vé tham quan." },
  { id: 7,  name: "Giặt ủi & khô",         icon: "👔", price: 15,    description: "Dịch vụ giặt ủi chuyên nghiệp, trả trong 24h. Giặt khô theo yêu cầu." },
  { id: 8,  name: "Tour & Khám phá",        icon: "🗺️", price: 20,    description: "Tổ chức tour tham quan địa phương, khám phá văn hóa, ẩm thực đặc sản. Hướng dẫn viên chuyên nghiệp." },
];

const ServicePage = () => {
  const navigate = useNavigate();
  const [services,         setServices]         = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [selectedService,  setSelectedService]  = useState(null);
  const [usingStatic,      setUsingStatic]      = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ApiService.getAllServices();
        const list = response.serviceList || response || [];
        if (list.length > 0) {
          setServices(list);
          setUsingStatic(false);
        } else {
          setServices(STATIC_SERVICES);
          setUsingStatic(true);
        }
      } catch (err) {
        // 403 hoặc lỗi khác → dùng data tĩnh, không báo lỗi
        console.warn("Services API:", err.message);
        setServices(STATIC_SERVICES);
        setUsingStatic(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="sv-page">

      {/* ── HERO ── */}
      <div className="sv-hero">
        <div className="sv-hero-inner">
          <p className="sv-hero-tag">DỊCH VỤ & TIỆN NGHI</p>
          <h1 className="sv-hero-h1">
            Trải nghiệm <span className="accent">đẳng cấp</span><br />tại BBHH Resort
          </h1>
          <p className="sv-hero-sub">
            Mọi dịch vụ được thiết kế để mang đến kỳ nghỉ hoàn hảo nhất cho bạn và gia đình
          </p>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div className="sv-body">
        <div className="sv-inner">

          {isLoading ? (
            <div className="ar-loading">
              <div className="bbhh-spinner" />
              <p>Đang tải dịch vụ...</p>
            </div>
          ) : (
            <div className="sv-grid">
              {services.map(service => (
                <div
                  key={service.id}
                  className="sv-card"
                  onClick={() => setSelectedService(service)}
                >
                  {/* Icon hoặc ảnh */}
                  <div className="sv-card-img">
                    {service.icon ? (
                      <span className="sv-card-emoji">{service.icon}</span>
                    ) : (
                      <img
                        src={`./assets/images/${IMAGE_MAP[service.name] || "wifi.png"}`}
                        alt={service.name}
                        onError={e => { e.target.src = "./assets/images/wifi.png"; }}
                      />
                    )}
                  </div>
                  <div className="sv-card-body">
                    <h3 className="sv-card-title">{service.name}</h3>
                    <p className="sv-card-desc">{service.description}</p>
                    <div className="sv-card-footer">
                      {service.price
                        ? <span className="sv-price">Từ ${service.price}</span>
                        : <span className="sv-price-free">Miễn phí</span>
                      }
                      <button className="sv-card-btn">Xem chi tiết →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA đăng nhập nếu đang dùng data tĩnh */}
          {usingStatic && !isLoading && (
            <div className="sv-login-nudge">
              <span>🔐</span>
              <p>Đăng nhập để xem đầy đủ dịch vụ và đặt trước</p>
              <button className="fb-help-btn primary" onClick={() => navigate("/login")}>
                Đăng nhập ngay
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── CTA ── */}
      <div className="sv-cta-section">
        <div className="sv-cta-box">
          <h2 className="sv-cta-h2">Sẵn sàng trải nghiệm?</h2>
          <p className="sv-cta-sub">Đặt phòng ngay hôm nay và tận hưởng toàn bộ dịch vụ 5 sao.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-gold" onClick={() => navigate("/rooms")}>🛏️ Đặt phòng ngay</button>
            <button className="btn-ghost-dark" onClick={() => navigate("/find-booking")}>🔍 Tra cứu đặt phòng</button>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {selectedService && (
        <div className="sv-modal-bg" onClick={() => setSelectedService(null)}>
          <div className="sv-modal" onClick={e => e.stopPropagation()}>
            <button className="sv-modal-close" onClick={() => setSelectedService(null)}>✕</button>

            <div className="sv-modal-icon">
              {selectedService.icon ? (
                <span>{selectedService.icon}</span>
              ) : (
                <img
                  src={`./assets/images/${IMAGE_MAP[selectedService.name] || "wifi.png"}`}
                  alt={selectedService.name}
                  onError={e => { e.target.src = "./assets/images/wifi.png"; }}
                  style={{ width: 56, height: 56, objectFit: "contain" }}
                />
              )}
            </div>

            <h3 className="sv-modal-title">{selectedService.name}</h3>
            <p className="sv-modal-desc">{selectedService.description}</p>

            {selectedService.price && (
              <div className="sv-modal-price">Từ <strong>${selectedService.price}</strong> / lần</div>
            )}
            {!selectedService.price && (
              <div className="sv-modal-price-free">✓ Miễn phí cho mọi khách lưu trú</div>
            )}

            <div className="sv-modal-actions">
              <button className="btn-gold" onClick={() => { setSelectedService(null); navigate("/rooms"); }}>
                🛏️ Đặt phòng để trải nghiệm
              </button>
              <button className="btn-outline-muted" onClick={() => setSelectedService(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
