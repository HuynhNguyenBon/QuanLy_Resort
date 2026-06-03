import React, { useState } from "react";
import "../../UiverseElements.css";

const CATEGORIES = [
  "Tất cả",
  "Phòng nghỉ",
  "Hồ bơi",
  "Nhà hàng",
  "Spa & Gym",
  "Khuôn viên",
];

const U = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const HERO_PHOTO_ID = "1520250497591-112f2f40a3f4";
const HERO_BG = U(HERO_PHOTO_ID, 1600);

const GALLERY_ITEMS = [
  // Khuôn viên
  {
    id: 1,
    featured: true,
    cat: "Khuôn viên",
    img: U("1520250497591-112f2f40a3f4"),
    title: "Toàn cảnh BBHH Resort",
  },
  {
    id: 2,
    cat: "Khuôn viên",
    img: U("1507525428034-b723cf961d3e"),
    title: "Bãi biển riêng",
  },
  {
    id: 3,
    cat: "Khuôn viên",
    img: U("1499793983690-e29da59ef1c2"),
    title: "Biển xanh nhiệt đới",
  },
  {
    id: 4,
    cat: "Khuôn viên",
    img: U("1540541338287-41700207dee6"),
    title: "Lối đi trong resort",
  },
  {
    id: 5,
    cat: "Khuôn viên",
    img: U("1566073771259-6a8506099945"),
    title: "Khu nghỉ dưỡng ven biển",
  },
  {
    id: 6,
    cat: "Khuôn viên",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    title: "Bờ biển lúc hoàng hôn",
  },
  {
    id: 7,
    cat: "Khuôn viên",
    img: U("1506929562872-bb421503ef21"),
    title: "Không gian nghỉ dưỡng",
  },
  {
    id: 8,
    cat: "Khuôn viên",
    img: U("1506744038136-46273834b3fb"),
    title: "Cảnh quan xanh mát",
  },
  {
    id: 9,
    cat: "Khuôn viên",
    img: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=80",
    title: "View sân vườn",
  },
  {
    id: 10,
    cat: "Khuôn viên",
    img: U("1484821582734-6c6c9f99a672"),
    title: "Hàng dừa ven biển",
  },
  {
    id: 11,
    cat: "Khuôn viên",
    img: U("1518509562904-e7ef99cdcc86"),
    title: "Khuôn viên thư giãn",
  },

  // Hồ bơi
  {
    id: 12,
    featured: true,
    cat: "Hồ bơi",
    img: U("1571896349842-33c89424de2d"),
    title: "Hồ bơi vô cực",
  },
  {
    id: 13,
    cat: "Hồ bơi",
    img: U("1510414842594-a61c69b5ae57"),
    title: "Pool Bar hoàng hôn",
  },
  {
    id: 14,
    cat: "Hồ bơi",
    img: U("1564501049412-61c2a3083791"),
    title: "Hồ bơi ngoài trời",
  },
  {
    id: 15,
    cat: "Hồ bơi",
    img: U("1542314831-068cd1dbfeeb"),
    title: "Khu vực bơi lội",
  },
  {
    id: 16,
    cat: "Hồ bơi",
    img: U("1563911302283-d2bc129e7570"),
    title: "Hồ bơi chiều tối",
  },
  {
    id: 17,
    cat: "Hồ bơi",
    img: U("1551882547-ff40c63fe5fa"),
    title: "Ghế nằm bên hồ",
  },
  {
    id: 18,
    cat: "Hồ bơi",
    img: U("1584132967334-10e028bd69f7"),
    title: "Không gian hồ bơi",
  },

  // Phòng nghỉ
  {
    id: 19,
    featured: true,
    cat: "Phòng nghỉ",
    img: U("1566665797739-1674de7a421a"),
    title: "Suite Hướng Biển",
  },
  {
    id: 20,
    cat: "Phòng nghỉ",
    img: U("1590490360182-c33d57733427"),
    title: "Phòng Deluxe",
  },
  {
    id: 21,
    cat: "Phòng nghỉ",
    img: U("1611892440504-42a792e24d32"),
    title: "Phòng Family",
  },
  {
    id: 22,
    cat: "Phòng nghỉ",
    img: U("1582719478250-c89cae4dc85b"),
    title: "Phòng Superior",
  },
  {
    id: 23,
    cat: "Phòng nghỉ",
    img: U("1618221195710-dd6b41faaea6"),
    title: "Phòng Executive",
  },
  {
    id: 24,
    cat: "Phòng nghỉ",
    img: U("1600585154340-be6161a56a0c"),
    title: "Phòng King Bed",
  },
  {
    id: 25,
    cat: "Phòng nghỉ",
    img: U("1595526114035-0d45ed16cfbf"),
    title: "Phòng Premium",
  },
  {
    id: 26,
    cat: "Phòng nghỉ",
    img: U("1616486338812-3dadae4b4ace"),
    title: "Phòng Standard",
  },
  {
    id: 27,
    cat: "Phòng nghỉ",
    img: U("1560448204-e02f11c3d0e2"),
    title: "Phòng Honeymoon",
  },
  {
    id: 28,
    cat: "Phòng nghỉ",
    img: U("1598928506311-c55ded91a20c"),
    title: "Phòng nghỉ đôi",
  },

  // Nhà hàng
  {
    id: 29,
    featured: true,
    cat: "Nhà hàng",
    img: U("1517248135467-4c7edcad34c4"),
    title: "Nhà hàng sang trọng",
  },
  {
    id: 30,
    cat: "Nhà hàng",
    img: U("1555396273-367ea4eb4db5"),
    title: "Bữa tối cao cấp",
  },
  {
    id: 31,
    cat: "Nhà hàng",
    img: U("1559339352-11d035aa65de"),
    title: "Sky Bar & Cocktail",
  },
  {
    id: 32,
    cat: "Nhà hàng",
    img: U("1414235077428-338989a2e8c0"),
    title: "Buffet sáng quốc tế",
  },
  {
    id: 33,
    cat: "Nhà hàng",
    img: U("1504674900247-0877df9cc836"),
    title: "Ẩm thực Á Âu",
  },
  {
    id: 34,
    cat: "Nhà hàng",
    img: U("1540189549336-e6e99c3679fe"),
    title: "Món ăn đặc sản",
  },
  {
    id: 35,
    cat: "Nhà hàng",
    img: U("1551218808-94e220e084d2"),
    title: "Bàn tiệc ngoài trời",
  },
  {
    id: 36,
    cat: "Nhà hàng",
    img: U("1521017432531-fbd92d768814"),
    title: "Wine & Dine",
  },
  {
    id: 37,
    cat: "Nhà hàng",
    img: U("1514933651103-005eec06c04b"),
    title: "Bar & Lounge",
  },

  // Spa & Gym
  {
    id: 38,
    featured: true,
    cat: "Spa & Gym",
    img: U("1544161515-4ab6ce6db874"),
    title: "Spa & Wellness",
  },
  {
    id: 39,
    cat: "Spa & Gym",
    img: U("1519823551278-64ac92734fb1"),
    title: "Liệu pháp thư giãn",
  },
  {
    id: 40,
    cat: "Spa & Gym",
    img: U("1534438327276-14e5300c3a48"),
    title: "Phòng tập Gym",
  },
  {
    id: 41,
    cat: "Spa & Gym",
    img: U("1540555700478-4be289fbecef"),
    title: "Massage toàn thân",
  },
  {
    id: 42,
    cat: "Spa & Gym",
    img: U("1515377905703-c4788e51af15"),
    title: "Liệu trình chăm sóc",
  },
  {
    id: 43,
    cat: "Spa & Gym",
    img: U("1600334129128-685c5582fd35"),
    title: "Liệu pháp đá nóng",
  },
  {
    id: 44,
    cat: "Spa & Gym",
    img: U("1571019613454-1cb2f99b2d8b"),
    title: "Khu tập luyện hiện đại",
  },
  {
    id: 45,
    cat: "Spa & Gym",
    img: U("1599901860904-17e6ed7083a0"),
    title: "Yoga & Thiền định",
  },
  {
    id: 46,
    cat: "Spa & Gym",
    img: U("1545205597-3d9d02c29597"),
    title: "Bể sục Jacuzzi",
  },
];

const GalleryPage = () => {
  const [active, setActive] = useState("Tất cả");
  const [lightbox, setLightbox] = useState(null);

  const shown =
    active === "Tất cả"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((g) => g.cat === active);

  return (
    <div className="gallery-page">
      {/* Hero */}
      <div
        className="gallery-hero"
        style={{
          backgroundImage: `linear-gradient(135deg,rgba(12,35,70,.82) 0%,rgba(20,65,100,.65) 100%), url(${HERO_BG})`,
        }}
      >
        <div className="gallery-hero-inner">
          <p className="gallery-hero-tag">📷 THƯ VIỆN ẢNH</p>

          <h1 className="gallery-hero-h1">
            Khám phá <span className="accent">BBHH Resort</span>
          </h1>

          <p className="gallery-hero-sub">
            {GALLERY_ITEMS.length} khoảnh khắc tuyệt đẹp tại resort của chúng
            tôi
          </p>

          <div className="gallery-hero-scroll">
            <span>Khám phá</span>
            <svg viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="gallery-filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`gallery-pill${active === cat ? " active" : ""}`}
            onClick={() => setActive(cat)}
          >
            {cat}

            {cat !== "Tất cả" && (
              <span className="gallery-pill-count">
                {GALLERY_ITEMS.filter((g) => g.cat === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="gallery-body">
        <div className="gallery-grid">
          {shown.map((item) => (
            <div
              key={item.id}
              className={`gallery-item${item.featured ? " gallery-featured" : ""}`}
              onClick={() => setLightbox(item)}
            >
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />

              <div className="gallery-img-error" style={{ display: "none" }}>
                🏨
              </div>

              <div className="gallery-item-overlay">
                <div>
                  <div className="gallery-item-cat">{item.cat}</div>
                  <div className="gallery-item-title">{item.title}</div>
                </div>

                <div className="gallery-item-zoom">🔍</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <div
            className="gallery-lb-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="gallery-lb-close"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>

            <img
              src={lightbox.img.replace(/w=\d+/, "w=1400")}
              alt={lightbox.title}
            />

            <div className="gallery-lb-info">
              <strong>{lightbox.title}</strong>
              <span>{lightbox.cat}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
