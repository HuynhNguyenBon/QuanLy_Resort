import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import "../../UiverseElements.css";

const AllRoomsPage = () => {
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
  const navigate = useNavigate();

  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  // Map: roomId → { roomType, roomDescription } bản dịch theo ngôn ngữ hiện tại
  const [translations, setTranslations] = useState({});

  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [searchType, setSearchType] = useState("");
  const [typeDropOpen, setTypeDropOpen] = useState(false);

  const roomsPerPage = 8;
  const typeDropRef = useRef(null);

  // ─── Lấy toàn bộ phòng lần đầu ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [roomsRes, typesRes] = await Promise.all([
          ApiService.getAllRooms(),
          ApiService.getRoomTypes(),
        ]);
        setAllRooms(roomsRes.roomList || []);
        setFilteredRooms(roomsRes.roomList || []);
        setRoomTypes(typesRes || []);
      } catch (err) {
        console.error("Lỗi tải phòng:", err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ─── Tải bản dịch khi ngôn ngữ hoặc danh sách phòng thay đổi ───────────────
  useEffect(() => {
    if (allRooms.length === 0) return;

    const lang = i18n.language.split("-")[0];
    // Nếu đang dùng tiếng Anh (en) thì không cần gọi API dịch

    const fetchAllTranslations = async () => {
      const results = await Promise.allSettled(
        allRooms.map((room) =>
          ApiService.getRoomTranslation(room.id, lang)
            .then((trans) => ({ id: room.id, trans }))
            .catch(() => ({ id: room.id, trans: null })),
        ),
      );

      const map = {};
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.trans) {
          map[r.value.id] = r.value.trans;
        }
      });
      setTranslations(map);
    };
    fetchAllTranslations();
  }, [allRooms, i18n.language]);

  // ─── Helper: lấy tên & mô tả phòng theo ngôn ngữ hiện tại ──────────────────
  const getRoomType = (room) =>
    translations[room.id]?.roomType || room.roomType || "";

  const getRoomDescription = (room) =>
    translations[room.id]?.roomDescription || room.roomDescription || "";

  const formatPrice = (price) => {
    if (!price) return "0";
    return Number(price).toLocaleString("en-US");
  };

  // ─── Close dropdown khi click ngoài ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (typeDropRef.current && !typeDropRef.current.contains(e.target))
        setTypeDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Filter theo loại phòng ──────────────────────────────────────────────────
  const filterByType = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
    if (isSearchMode) {
      setFilteredRooms(
        type === ""
          ? allRooms.filter((r) => r._isAvailable)
          : allRooms.filter((r) => r._isAvailable && r.roomType === type),
      );
    } else {
      setFilteredRooms(
        type === "" ? allRooms : allRooms.filter((r) => r.roomType === type),
      );
    }
  };

  // ─── Tìm phòng theo ngày ─────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setSearchError(
        t(
          "allRoomsPage.errorSelectDates",
          "Vui lòng chọn ngày nhận và trả phòng.",
        ),
      );
      setTimeout(() => setSearchError(""), 4000);
      return;
    }
    if (checkIn >= checkOut) {
      setSearchError(
        t(
          "allRoomsPage.errorCheckoutAfterCheckin",
          "Ngày trả phòng phải sau ngày nhận phòng.",
        ),
      );
      setTimeout(() => setSearchError(""), 4000);
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const start = checkIn.toISOString().split("T")[0];
      const end = checkOut.toISOString().split("T")[0];

      let availableRooms = [];
      if (searchType) {
        const res = await ApiService.getAvailableRoomsByDateAndType(
          start,
          end,
          searchType,
        );
        availableRooms = res.roomList || [];
      } else {
        const results = await Promise.all(
          roomTypes.map((type) =>
            ApiService.getAvailableRoomsByDateAndType(start, end, type)
              .then((r) => r.roomList || [])
              .catch(() => []),
          ),
        );
        availableRooms = results.flat();
      }

      const availableIds = new Set(availableRooms.map((r) => r.id));
      const tagged = allRooms.map((r) => ({
        ...r,
        _isAvailable: availableIds.has(r.id),
      }));
      setAllRooms(tagged);

      const shown = availableRooms.filter(
        (r) => !selectedType || r.roomType === selectedType,
      );
      setFilteredRooms(shown);
      setIsSearchMode(true);
      setCurrentPage(1);
      setShowSearch(false);

      if (shown.length === 0) {
        setSearchError(
          t(
            "allRoomsPage.noRoomsFound",
            "Không có phòng trống trong khoảng thời gian này. Hãy thử ngày khác.",
          ),
        );
      }
    } catch (err) {
      setSearchError(
        t(
          "allRoomsPage.searchError",
          "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.",
        ),
      );
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const resetSearch = () => {
    setIsSearchMode(false);
    setCheckIn(null);
    setCheckOut(null);
    setSearchType("");
    setSelectedType("");
    setFilteredRooms(allRooms.map((r) => ({ ...r, _isAvailable: undefined })));
    setCurrentPage(1);
    setSearchError("");
    setShowSearch(false);
  };

  const indexOfLast = currentPage * roomsPerPage;
  const indexOfFirst = indexOfLast - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  const formatDate = (d) =>
    d
      ? d.toLocaleDateString(
          i18n.language.split("-")[0] === "vi" ? "vi-VN" : "en-US",
        )
      : null;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="ar-page">
      {/* ── HERO ── */}
      <div className="ar-hero">
        <div className="ar-hero-inner">
          <p className="ar-hero-tag">
            {t("allRoomsPage.heroTag", "PHÒNG NGHỈ")}
          </p>
          <h1 className="ar-hero-h1">
            {t("allRoomsPage.heroTitle", "Chọn phòng hoàn hảo cho bạn")}
          </h1>
          <p className="ar-hero-sub">
            {isSearchMode
              ? `${filteredRooms.length} ${t("allRoomsPage.availableRooms", "phòng trống")}${checkIn && checkOut ? ` · ${formatDate(checkIn)} → ${formatDate(checkOut)}` : ""}`
              : `${filteredRooms.length} ${t("allRoomsPage.roomsFrom", "phòng · từ Standard đến Suite cao cấp")}`}
          </p>
        </div>
      </div>

      {/* ── FILTER + SEARCH BAR ── */}
      <div className="ar-filter-bar">
        <div className="ar-filter-inner">
          {/* Type pill filter */}
          <div className="ar-type-pills">
            <button
              className={`ar-pill${selectedType === "" ? " active" : ""}`}
              onClick={() => filterByType("")}
            >
              {t("allRoomsPage.all", "Tất cả")}
            </button>
            {roomTypes.slice(0, 6).map((type) => (
              <button
                key={type}
                className={`ar-pill${selectedType === type ? " active" : ""}`}
                onClick={() => filterByType(type)}
              >
                {/* Dùng bản dịch roomType từ translations nếu có */}
                {Object.values(translations).find(
                  (tr) => tr.roomType && tr._origType === type,
                )?.roomType || type}
              </button>
            ))}
          </div>

          {/* Search by date button */}
          <button
            className={`ar-search-toggle${showSearch ? " active" : ""}`}
            onClick={() => setShowSearch((p) => !p)}
          >
            🔍{" "}
            {isSearchMode
              ? `${formatDate(checkIn)} → ${formatDate(checkOut)}`
              : t("allRoomsPage.searchByDate", "Tìm theo ngày")}
          </button>

          {isSearchMode && (
            <button className="ar-reset-btn" onClick={resetSearch}>
              ✕ {t("allRoomsPage.viewAll", "Xem tất cả phòng")}
            </button>
          )}

          <span className="ar-count">
            <strong>{filteredRooms.length}</strong>{" "}
            {isSearchMode
              ? t("allRoomsPage.availableRooms", "phòng trống")
              : t("allRoomsPage.rooms", "phòng")}
          </span>
        </div>

        {/* ── INLINE SEARCH PANEL ── */}
        {showSearch && (
          <div className="ar-search-panel">
            <div className="ar-search-inner">
              <div className="ar-search-field">
                <label>{t("allRoomsPage.checkIn", "NGÀY NHẬN PHÒNG")}</label>
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  dateFormat={getDateFormat()}
                  placeholderText={t("allRoomsPage.pickDate", "Chọn ngày")}
                  minDate={new Date()}
                  autoComplete="off"
                />
              </div>

              <div className="ar-search-field">
                <label>{t("allRoomsPage.checkOut", "NGÀY TRẢ PHÒNG")}</label>
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  dateFormat={getDateFormat()}
                  placeholderText={t("allRoomsPage.pickDate", "Chọn ngày")}
                  minDate={checkIn || new Date()}
                  autoComplete="off"
                />
              </div>

              <div
                className="ar-search-field"
                ref={typeDropRef}
                style={{ position: "relative" }}
              >
                <label>
                  {t("allRoomsPage.roomType", "LOẠI PHÒNG (TÙY CHỌN)")}
                </label>
                <button
                  type="button"
                  className="ar-search-drop-btn"
                  onClick={() => setTypeDropOpen((p) => !p)}
                >
                  <span>
                    {searchType || t("allRoomsPage.allTypes", "Tất cả loại")}
                  </span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: typeDropOpen ? "rotate(180deg)" : "none",
                      transition: "0.2s",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {typeDropOpen && (
                  <div className="ar-filter-dropdown">
                    <div
                      className={`ar-filter-option${searchType === "" ? " active" : ""}`}
                      onClick={() => {
                        setSearchType("");
                        setTypeDropOpen(false);
                      }}
                    >
                      {t("allRoomsPage.allTypes", "Tất cả loại phòng")}
                    </div>
                    {roomTypes.map((type) => (
                      <div
                        key={type}
                        className={`ar-filter-option${searchType === type ? " active" : ""}`}
                        onClick={() => {
                          setSearchType(type);
                          setTypeDropOpen(false);
                        }}
                      >
                        {searchType === type && (
                          <span className="ar-check">✓</span>
                        )}
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="ar-search-btn"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching
                  ? t("allRoomsPage.searching", "Đang tìm...")
                  : `🔍 ${t("allRoomsPage.findRooms", "Tìm phòng trống")}`}
              </button>
            </div>

            {searchError && (
              <div className="ar-search-error">{searchError}</div>
            )}
          </div>
        )}
      </div>

      {/* ── ROOM GRID ── */}
      <div className="ar-body">
        {loading ? (
          <div className="ar-loading">
            <div className="bbhh-spinner" />
            <p>
              {t("allRoomsPage.loadingRooms", "Đang tải danh sách phòng...")}
            </p>
          </div>
        ) : searching ? (
          <div className="ar-loading">
            <div className="bbhh-spinner" />
            <p>{t("allRoomsPage.searchingRooms", "Đang tìm phòng trống...")}</p>
          </div>
        ) : currentRooms.length === 0 ? (
          <div className="ar-empty">
            <div className="ar-empty-icon">🛏️</div>
            <h3>
              {isSearchMode
                ? t("allRoomsPage.noAvailable", "Không có phòng trống")
                : t("allRoomsPage.notFound", "Không tìm thấy phòng")}
            </h3>
            <p>
              {isSearchMode
                ? t(
                    "allRoomsPage.tryOtherDates",
                    "Hãy thử chọn ngày khác hoặc loại phòng khác.",
                  )
                : t(
                    "allRoomsPage.tryOtherType",
                    "Hãy thử chọn loại phòng khác.",
                  )}
            </p>
            <button className="btn-gold" onClick={resetSearch}>
              {t("allRoomsPage.viewAll", "Xem tất cả phòng")}
            </button>
          </div>
        ) : (
          <>
            {isSearchMode && (
              <div className="ar-mode-badge">
                {t("allRoomsPage.availableBadge", {
                  count: filteredRooms.length,
                  checkIn: formatDate(checkIn),
                  checkOut: formatDate(checkOut),
                  defaultValue: `Hiện có ${filteredRooms.length} phòng còn trống từ ${formatDate(checkIn)} đến ${formatDate(checkOut)}`,
                })}
                <button onClick={resetSearch}>
                  {t("allRoomsPage.viewAllArrow", "Xem tất cả →")}
                </button>
              </div>
            )}

            <div className="ar-grid">
              {currentRooms.map((room) => (
                <div
                  key={room.id}
                  className="ar-card"
                  onClick={() => navigate(`/room-details-book/${room.id}`)}
                >
                  <div className="ar-card-img">
                    <img src={room.roomPhotoUrl} alt={getRoomType(room)} />
                    {/* Badge loại phòng — đã dịch */}
                    <span className="ar-card-type">{getRoomType(room)}</span>
                    {isSearchMode && (
                      <span className="ar-available-badge">
                        ✓ {t("allRoomsPage.available", "Còn phòng")}
                      </span>
                    )}
                  </div>

                  <div className="ar-card-body">
                    {/* Tên phòng — đã dịch */}
                    <h3 className="ar-card-title">{getRoomType(room)}</h3>

                    {/* Mô tả phòng — đã dịch */}
                    <p className="ar-card-desc">{getRoomDescription(room)}</p>

                    <div className="ar-card-amenities">
                      <span>📶 WiFi</span>
                      <span>❄️ {t("allRoomsPage.amenityAC", "Điều hòa")}</span>
                      <span>🏊 {t("allRoomsPage.amenityPool", "Hồ bơi")}</span>
                    </div>

                    <div className="ar-card-footer">
                      <div className="ar-card-price">
                        {/* Giá — format chuẩn, không lẫn locale tiền tệ */}
                        <span className="ar-price-num">
                          ${formatPrice(room.roomPrice)}
                        </span>
                        <span className="ar-price-per">
                          / {t("allRoomsPage.night", "đêm")}
                        </span>
                      </div>
                      <button
                        className="ar-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/room-details-book/${room.id}`);
                        }}
                      >
                        {t("allRoomsPage.bookNow", "Đặt ngay")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRooms.length > roomsPerPage && (
              <Pagination
                roomsPerPage={roomsPerPage}
                totalRooms={filteredRooms.length}
                currentPage={currentPage}
                paginate={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllRoomsPage;
