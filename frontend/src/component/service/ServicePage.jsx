import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const IMAGE_MAP = {
  "Luxury Mini Bar":          "mini-bar.png",
  "Gourmet Breakfast":        "breakfast.png",
  "Spa & Wellness Center":    "spa.png",
  "Spa & Massage":            "spa.png",
  "Laundry & Dry Cleaning":   "laundry.png",
  "Room Service 24/7":        "room-service.png",
  "Private Pool Access":      "pool.png",
  "Infinity Swimming Pool":   "pool.png",
  "Fitness & Yoga Class":     "gym.png",
  "Modern Fitness Center":    "gym.png",
};

// Emoji fallback theo tên
const EMOJI_MAP = {
  "Luxury Mini Bar":           "🥂",
  "Gourmet Breakfast":         "🍳",
  "Spa & Wellness Center":     "💆",
  "Spa & Massage":             "💆",
  "Airport Shuttle Service":   "✈️",
  "Airport Transfer":          "✈️",
  "Laundry & Dry Cleaning":    "👔",
  "Room Service 24/7":         "🛎️",
  "Private Pool Access":       "🏊",
  "Fitness & Yoga Class":      "🧘",
  "Beach BBQ Dinner":          "🍖",
  "Room Decoration":           "🌹",
  "Tour & Sightseeing":        "🗺️",
  "Bicycle Rental":            "🚲",
  "Cocktail & Drinks Package": "🍹",
  "Babysitting Service":       "👶",
  "Water Sports Package":      "🤿",
  "Photography Session":       "📸",
  "Sunset Cruise":             "⛵",
  "Cooking Class":             "👨‍🍳",
  "Flower Arrangement":        "💐",
  "Pet Care Service":          "🐾",
  "Golf Cart Rental":          "⛳",
  "Karaoke Room":              "🎤",
  "In-Room Movie Night":       "🎬",
};

// Dịch vụ tĩnh — hiển thị khi API không có hoặc bổ sung thêm
const STATIC_SERVICES = [
  { id: 101, name: "Spa & Massage",             price: 50,  description: "Liệu trình massage thư giãn 60 phút với tinh dầu thiên nhiên. Phục hồi năng lượng toàn diện." },
  { id: 102, name: "Gourmet Breakfast",         price: 15,  description: "Buffet sáng quốc tế hơn 40 món, nguyên liệu tươi mỗi ngày. Phục vụ từ 6:30–10:30." },
  { id: 103, name: "Airport Transfer",          price: 30,  description: "Đưa đón sân bay bằng xe sang, đúng giờ, phục vụ 24/7. Đặt trước ít nhất 6 giờ." },
  { id: 104, name: "Laundry & Dry Cleaning",    price: 15,  description: "Giặt ủi chuyên nghiệp, trả trong 24 giờ. Dịch vụ giặt khô theo yêu cầu." },
  { id: 105, name: "Luxury Mini Bar",           price: 25,  description: "Gói đồ uống: rượu vang, cocktail, nước trái cây tươi và đồ ăn nhẹ cao cấp." },
  { id: 106, name: "Room Service 24/7",         price: 20,  description: "Phục vụ ăn uống tận phòng bất kỳ lúc nào với thực đơn Á–Âu đa dạng." },
  { id: 107, name: "Private Pool Access",       price: 40,  description: "Thuê riêng hồ bơi vô cực tầng thượng 2 giờ. Kèm đồ uống miễn phí và ghế nằm VIP." },
  { id: 108, name: "Fitness & Yoga Class",      price: 20,  description: "Lớp yoga bình minh hoặc PT gym riêng. Lịch linh hoạt theo yêu cầu." },
  { id: 109, name: "Beach BBQ Dinner",          price: 80,  description: "Bữa tối nướng trên bãi biển riêng cho 2 người, kèm rượu vang và nhạc live." },
  { id: 110, name: "Room Decoration",           price: 35,  description: "Trang trí phòng theo chủ đề: sinh nhật, kỷ niệm, lãng mạn. Hoa tươi và nến." },
  { id: 111, name: "Tour & Sightseeing",        price: 35,  description: "Tour tham quan địa phương cùng hướng dẫn viên. Khởi hành 8:00 sáng hàng ngày." },
  { id: 112, name: "Bicycle Rental",            price: 10,  description: "Thuê xe đạp khám phá xung quanh resort. Mũ bảo hiểm và bản đồ đi kèm." },
  { id: 113, name: "Cocktail & Drinks Package", price: 20,  description: "Gói cocktail thủ công tại pool bar: 5 ly theo lựa chọn, phục vụ từ 15:00–21:00." },
  { id: 114, name: "Babysitting Service",       price: 25,  description: "Dịch vụ trông trẻ chuyên nghiệp theo giờ. An toàn, vui vẻ cho bé từ 1–10 tuổi." },
  { id: 115, name: "Water Sports Package",      price: 45,  description: "Gói thể thao nước: kayak, paddleboard, snorkeling. Hướng dẫn viên đi kèm." },
  { id: 116, name: "Photography Session",       price: 60,  description: "Chụp ảnh kỷ niệm chuyên nghiệp tại các điểm đẹp của resort (45 phút, 20+ ảnh chỉnh sửa)." },
  { id: 117, name: "Sunset Cruise",             price: 55,  description: "Ngắm hoàng hôn trên du thuyền 2 giờ, kèm cocktail và snack cao cấp." },
  { id: 118, name: "Cooking Class",             price: 30,  description: "Học nấu ẩm thực địa phương cùng đầu bếp resort. Mang công thức về nhà." },
  { id: 119, name: "Flower Arrangement",        price: 25,  description: "Workshop cắm hoa nghệ thuật 90 phút. Mang tác phẩm của bạn về phòng." },
  { id: 120, name: "Pet Care Service",          price: 20,  description: "Chăm sóc thú cưng theo giờ khi bạn đi tham quan. An toàn và chu đáo." },
  { id: 121, name: "Golf Cart Rental",          price: 15,  description: "Thuê xe golf điện khám phá khuôn viên resort rộng lớn. Tối đa 4 người." },
  { id: 122, name: "Karaoke Room",              price: 40,  description: "Phòng karaoke riêng tư 2 giờ cho nhóm đến 10 người, hệ thống âm thanh cao cấp." },
  { id: 123, name: "In-Room Movie Night",       price: 25,  description: "Gói xem phim trong phòng: màn chiếu HD, popcorn, đồ uống và chăn mềm cho 2 người." },
];

const CART_KEY = "bbhh_selected_services";

const getEmoji = (service) =>
  service.emoji || EMOJI_MAP[service.name] || "🛎️";

const getImage = (name) => IMAGE_MAP[name] || null;

const ServicePage = () => {
  const navigate = useNavigate();
  const [services,  setServices]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart,      setCart]      = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  });
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ApiService.getAllServices();
        const apiList  = response.serviceList || response || [];
        const apiPaid  = apiList.filter(s => s.price != null && s.price > 0);

        // Merge: API trước, bổ sung STATIC nếu tên VÀ ảnh chưa có trong API
        const apiNames  = new Set(apiPaid.map(s => s.name));
        const apiImages = new Set(apiPaid.map(s => getImage(s.name)).filter(Boolean));
        const staticExtra = STATIC_SERVICES.filter(s => {
          const img = getImage(s.name);
          return !apiNames.has(s.name) && !(img && apiImages.has(img));
        });
        setServices([...apiPaid, ...staticExtra]);
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

  const isInCart = (id) => cart.some(s => s.id === id);

  const toggleCart = (service) => {
    if (isInCart(service.id)) {
      setCart(prev => prev.filter(s => s.id !== service.id));
    } else {
      setCart(prev => [...prev, { id: service.id, name: service.name, price: service.price }]);
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
          <p className="sv-hero-tag">DỊCH VỤ & TIỆN NGHI</p>
          <h1 className="sv-hero-h1">
            Trải nghiệm <span className="accent">đẳng cấp</span><br />tại BBHH Resort
          </h1>
          <p className="sv-hero-sub">
            Chọn các dịch vụ yêu thích để thêm vào đặt phòng của bạn
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
              {services.map(service => {
                const inCart   = isInCart(service.id);
                const justAdd  = addedId === service.id;
                const imgFile  = getImage(service.name);
                return (
                  <div key={service.id} className={`sv-card${inCart ? " sv-card-selected" : ""}`}>
                    <div className="sv-card-img">
                      {imgFile ? (
                        <img
                          src={`./assets/images/${imgFile}`}
                          alt={service.name}
                          loading="lazy"
                          onError={e => {
                            e.target.style.display = "none";
                            e.target.parentNode.querySelector(".sv-card-emoji").style.display = "block";
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
                      <h3 className="sv-card-title">{service.name}</h3>
                      <p className="sv-card-desc">{service.description}</p>
                      <div className="sv-card-footer">
                        <span className="sv-price">Từ ${service.price}</span>
                        <button
                          className={`sv-add-btn${inCart ? " sv-add-btn-added" : ""}`}
                          onClick={() => toggleCart(service)}
                        >
                          {justAdd ? "✓ Đã thêm!" : inCart ? "✓ Đã chọn · Xóa" : "+ Thêm vào đặt phòng"}
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
          <h2 className="sv-cta-h2">Sẵn sàng trải nghiệm?</h2>
          <p className="sv-cta-sub">Đặt phòng ngay hôm nay và tận hưởng toàn bộ dịch vụ 5 sao.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-gold" onClick={() => navigate("/rooms")}>🛏️ Đặt phòng ngay</button>
            <button className="btn-ghost-dark" onClick={() => navigate("/find-booking")}>🔍 Tra cứu đặt phòng</button>
          </div>
        </div>
      </div>

      {/* ── FLOATING CART ── */}
      {cart.length > 0 && (
        <div className="sv-float-cart">
          <div className="sv-float-cart-info">
            <span className="sv-float-cart-count">{cart.length}</span>
            <div>
              <div className="sv-float-cart-label">dịch vụ đã chọn</div>
              {cartTotal > 0 && (
                <div className="sv-float-cart-total">+${cartTotal} phí dịch vụ</div>
              )}
            </div>
          </div>
          <div className="sv-float-cart-actions">
            <button className="sv-float-cart-clear" onClick={() => setCart([])}>
              Xóa tất cả
            </button>
            <button className="sv-float-cart-book" onClick={() => navigate("/rooms")}>
              Chọn phòng →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
