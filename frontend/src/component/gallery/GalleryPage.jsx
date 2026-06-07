import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../../UiverseElements.css";

const CAT_KEYS = [
  "Phòng nghỉ",
  "Hồ bơi",
  "Nhà hàng",
  "Spa & Gym",
  "Khuôn viên",
];

const U = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const HERO_BG = U("1520250497591-112f2f40a3f4", 1600);

const GALLERY_ITEMS = [
  {
    id: 1,
    featured: true,
    cat: "Khuôn viên",
    img: U("1520250497591-112f2f40a3f4"),
  },
  { id: 2, cat: "Khuôn viên", img: U("1507525428034-b723cf961d3e") },
  { id: 3, cat: "Khuôn viên", img: U("1499793983690-e29da59ef1c2") },
  { id: 4, cat: "Khuôn viên", img: U("1540541338287-41700207dee6") },
  { id: 5, cat: "Khuôn viên", img: U("1566073771259-6a8506099945") },
  {
    id: 6,
    cat: "Khuôn viên",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  { id: 7, cat: "Khuôn viên", img: U("1506929562872-bb421503ef21") },
  { id: 8, cat: "Khuôn viên", img: U("1506744038136-46273834b3fb") },
  {
    id: 9,
    cat: "Khuôn viên",
    img: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=80",
  },
  { id: 10, cat: "Khuôn viên", img: U("1484821582734-6c6c9f99a672") },
  { id: 11, cat: "Khuôn viên", img: U("1518509562904-e7ef99cdcc86") },
  {
    id: 12,
    featured: true,
    cat: "Hồ bơi",
    img: U("1571896349842-33c89424de2d"),
  },
  { id: 13, cat: "Hồ bơi", img: U("1510414842594-a61c69b5ae57") },
  { id: 14, cat: "Hồ bơi", img: U("1564501049412-61c2a3083791") },
  { id: 15, cat: "Hồ bơi", img: U("1542314831-068cd1dbfeeb") },
  { id: 16, cat: "Hồ bơi", img: U("1563911302283-d2bc129e7570") },
  { id: 17, cat: "Hồ bơi", img: U("1551882547-ff40c63fe5fa") },
  { id: 18, cat: "Hồ bơi", img: U("1584132967334-10e028bd69f7") },
  {
    id: 19,
    featured: true,
    cat: "Phòng nghỉ",
    img: U("1566665797739-1674de7a421a"),
  },
  { id: 20, cat: "Phòng nghỉ", img: U("1590490360182-c33d57733427") },
  { id: 21, cat: "Phòng nghỉ", img: U("1611892440504-42a792e24d32") },
  { id: 22, cat: "Phòng nghỉ", img: U("1582719478250-c89cae4dc85b") },
  { id: 23, cat: "Phòng nghỉ", img: U("1618221195710-dd6b41faaea6") },
  { id: 24, cat: "Phòng nghỉ", img: U("1600585154340-be6161a56a0c") },
  { id: 25, cat: "Phòng nghỉ", img: U("1595526114035-0d45ed16cfbf") },
  { id: 26, cat: "Phòng nghỉ", img: U("1616486338812-3dadae4b4ace") },
  { id: 27, cat: "Phòng nghỉ", img: U("1560448204-e02f11c3d0e2") },
  { id: 28, cat: "Phòng nghỉ", img: U("1598928506311-c55ded91a20c") },
  {
    id: 29,
    featured: true,
    cat: "Nhà hàng",
    img: U("1517248135467-4c7edcad34c4"),
  },
  { id: 30, cat: "Nhà hàng", img: U("1555396273-367ea4eb4db5") },
  { id: 31, cat: "Nhà hàng", img: U("1559339352-11d035aa65de") },
  { id: 32, cat: "Nhà hàng", img: U("1414235077428-338989a2e8c0") },
  { id: 33, cat: "Nhà hàng", img: U("1504674900247-0877df9cc836") },
  { id: 34, cat: "Nhà hàng", img: U("1540189549336-e6e99c3679fe") },
  { id: 35, cat: "Nhà hàng", img: U("1551218808-94e220e084d2") },
  { id: 36, cat: "Nhà hàng", img: U("1521017432531-fbd92d768814") },
  { id: 37, cat: "Nhà hàng", img: U("1514933651103-005eec06c04b") },
  {
    id: 38,
    featured: true,
    cat: "Spa & Gym",
    img: U("1544161515-4ab6ce6db874"),
  },
  { id: 39, cat: "Spa & Gym", img: U("1519823551278-64ac92734fb1") },
  { id: 40, cat: "Spa & Gym", img: U("1534438327276-14e5300c3a48") },
  { id: 41, cat: "Spa & Gym", img: U("1540555700478-4be289fbecef") },
  { id: 42, cat: "Spa & Gym", img: U("1515377905703-c4788e51af15") },
  { id: 43, cat: "Spa & Gym", img: U("1600334129128-685c5582fd35") },
  { id: 44, cat: "Spa & Gym", img: U("1571019613454-1cb2f99b2d8b") },
  { id: 45, cat: "Spa & Gym", img: U("1599901860904-17e6ed7083a0") },
  { id: 46, cat: "Spa & Gym", img: U("1545205597-3d9d02c29597") },
];

const GalleryPage = () => {
  const { t } = useTranslation("gallery");
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  const shown =
    active === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((g) => g.cat === active);

  const getCatLabel = (catKey) => t(`categories.${catKey}`, catKey);

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
          <p className="gallery-hero-tag">{t("heroTag")}</p>
          <h1 className="gallery-hero-h1">
            {t("heroTitle1")} <span className="accent">{t("heroAccent")}</span>
          </h1>
          <p className="gallery-hero-sub">
            {t("heroSub", { count: GALLERY_ITEMS.length })}
          </p>
          <div className="gallery-hero-scroll">
            <span>{t("heroScroll")}</span>
            <svg viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="gallery-filter-bar">
        <button
          className={`gallery-pill${active === "all" ? " active" : ""}`}
          onClick={() => setActive("all")}
        >
          {t("all")}
        </button>
        {CAT_KEYS.map((cat) => (
          <button
            key={cat}
            className={`gallery-pill${active === cat ? " active" : ""}`}
            onClick={() => setActive(cat)}
          >
            {getCatLabel(cat)}
            <span className="gallery-pill-count">
              {GALLERY_ITEMS.filter((g) => g.cat === cat).length}
            </span>
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
                alt={t(`items.${item.id}`)}
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
                  <div className="gallery-item-cat">
                    {getCatLabel(item.cat)}
                  </div>
                  <div className="gallery-item-title">
                    {t(`items.${item.id}`)}
                  </div>
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
              alt={t(`items.${lightbox.id}`)}
            />
            <div className="gallery-lb-info">
              <strong>{t(`items.${lightbox.id}`)}</strong>
              <span>{getCatLabel(lightbox.cat)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
