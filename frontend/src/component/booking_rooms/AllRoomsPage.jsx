import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import "../../UiverseElements.css";

const AllRoomsPage = () => {
  const { t } = useTranslation("rooms");
  const navigate = useNavigate();

  const [allRooms,       setAllRooms]       = useState([]);
  const [filteredRooms,  setFilteredRooms]  = useState([]);
  const [roomTypes,      setRoomTypes]      = useState([]);
  const [selectedType,   setSelectedType]   = useState("");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [searching,      setSearching]      = useState(false);
  const [searchError,    setSearchError]    = useState("");
  const [isSearchMode,   setIsSearchMode]   = useState(false);

  // Search state
  const [showSearch,  setShowSearch]  = useState(false);
  const [checkIn,     setCheckIn]     = useState(null);
  const [checkOut,    setCheckOut]    = useState(null);
  const [searchType,  setSearchType]  = useState("");
  const [dropOpen,    setDropOpen]    = useState(false);
  const [typeDropOpen,setTypeDropOpen]= useState(false);

  const roomsPerPage = 8;
  const dropRef     = useRef(null);
  const typeDropRef = useRef(null);

  // Load tất cả phòng lúc đầu
  useEffect(() => {
    const init = async () => {
      try {
        const [roomsRes, typesRes] = await Promise.all([
          ApiService.getAllRooms(),
          ApiService.getRoomTypes(),
        ]);
        setAllRooms(roomsRes.roomList);
        setFilteredRooms(roomsRes.roomList);
        setRoomTypes(typesRes);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Click ngoài đóng dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current     && !dropRef.current.contains(e.target))     setDropOpen(false);
      if (typeDropRef.current && !typeDropRef.current.contains(e.target)) setTypeDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter theo loại phòng (chỉ hoạt động khi không đang search theo ngày)
  const filterByType = (type) => {
    setSelectedType(type);
    setDropOpen(false);
    setCurrentPage(1);
    if (isSearchMode) {
      // Đang ở search mode — filter trong kết quả search
      setFilteredRooms(
        type === ""
          ? allRooms.filter(r => r._isAvailable)
          : allRooms.filter(r => r._isAvailable && r.roomType === type)
      );
    } else {
      setFilteredRooms(type === "" ? allRooms : allRooms.filter(r => r.roomType === type));
    }
  };

  // Tìm phòng theo ngày — chỉ hiện phòng CHƯA ĐƯỢC ĐẶT trong khoảng đó
  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setSearchError("Vui lòng chọn ngày nhận và trả phòng.");
      setTimeout(() => setSearchError(""), 4000);
      return;
    }
    if (checkIn >= checkOut) {
      setSearchError("Ngày trả phòng phải sau ngày nhận phòng.");
      setTimeout(() => setSearchError(""), 4000);
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const start = checkIn.toISOString().split("T")[0];
      const end   = checkOut.toISOString().split("T")[0];

      // Nếu không chọn loại phòng — gọi tất cả loại song song
      let availableRooms = [];

      if (searchType) {
        const res = await ApiService.getAvailableRoomsByDateAndType(start, end, searchType);
        availableRooms = res.roomList || [];
      } else {
        // Gọi từng loại phòng song song rồi gộp lại
        const results = await Promise.all(
          roomTypes.map(type =>
            ApiService.getAvailableRoomsByDateAndType(start, end, type)
              .then(r => r.roomList || [])
              .catch(() => [])
          )
        );
        availableRooms = results.flat();
      }

      // Đánh dấu phòng nào available
      const availableIds = new Set(availableRooms.map(r => r.id));
      const tagged = allRooms.map(r => ({ ...r, _isAvailable: availableIds.has(r.id) }));
      setAllRooms(tagged);

      // Chỉ hiển thị phòng còn trống
      const shown = availableRooms.filter(r =>
        !selectedType || r.roomType === selectedType
      );
      setFilteredRooms(shown);
      setIsSearchMode(true);
      setCurrentPage(1);
      setShowSearch(false);

      if (shown.length === 0) {
        setSearchError("Không có phòng trống trong khoảng thời gian này. Hãy thử ngày khác.");
      }
    } catch (err) {
      setSearchError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Reset về hiển thị tất cả phòng
  const resetSearch = () => {
    setIsSearchMode(false);
    setCheckIn(null);
    setCheckOut(null);
    setSearchType("");
    setSelectedType("");
    setFilteredRooms(allRooms.map(r => ({ ...r, _isAvailable: undefined })));
    setCurrentPage(1);
    setSearchError("");
    setShowSearch(false);
  };

  const indexOfLast  = currentPage * roomsPerPage;
  const indexOfFirst = indexOfLast - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  const formatDate = (d) => d ? d.toLocaleDateString("vi-VN") : null;

  return (
    <div className="ar-page">

      {/* ── HERO ── */}
      <div className="ar-hero">
        <div className="ar-hero-inner">
          <p className="ar-hero-tag">PHÒNG NGHỈ</p>
          <h1 className="ar-hero-h1">Chọn phòng hoàn hảo cho bạn</h1>
          <p className="ar-hero-sub">
            {isSearchMode
              ? `${filteredRooms.length} phòng trống ${checkIn && checkOut ? `· ${formatDate(checkIn)} → ${formatDate(checkOut)}` : ""}`
              : `${filteredRooms.length} phòng · từ Standard đến Suite cao cấp`}
          </p>
        </div>
      </div>

      {/* ── FILTER + SEARCH BAR ── */}
      <div className="ar-filter-bar">
        <div className="ar-filter-inner">

          {/* Type pill filter */}
          <div className="ar-type-pills">
            <button className={`ar-pill${selectedType === "" ? " active" : ""}`} onClick={() => filterByType("")}>Tất cả</button>
            {roomTypes.slice(0, 6).map(type => (
              <button key={type} className={`ar-pill${selectedType === type ? " active" : ""}`} onClick={() => filterByType(type)}>
                {type}
              </button>
            ))}
          </div>

          {/* Search by date button */}
          <button
            className={`ar-search-toggle${showSearch ? " active" : ""}`}
            onClick={() => setShowSearch(p => !p)}
          >
            🔍 {isSearchMode ? `${formatDate(checkIn)} → ${formatDate(checkOut)}` : "Tìm theo ngày"}
          </button>

          {/* Reset nếu đang search mode */}
          {isSearchMode && (
            <button className="ar-reset-btn" onClick={resetSearch}>
              ✕ Xem tất cả phòng
            </button>
          )}

          <span className="ar-count">
            <strong>{filteredRooms.length}</strong> {isSearchMode ? "phòng trống" : "phòng"}
          </span>
        </div>

        {/* ── INLINE SEARCH PANEL ── */}
        {showSearch && (
          <div className="ar-search-panel">
            <div className="ar-search-inner">

              {/* Check-in */}
              <div className="ar-search-field">
                <label>NGÀY NHẬN PHÒNG</label>
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày"
                  minDate={new Date()}
                  autoComplete="off"
                />
              </div>

              {/* Check-out */}
              <div className="ar-search-field">
                <label>NGÀY TRẢ PHÒNG</label>
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày"
                  minDate={checkIn || new Date()}
                  autoComplete="off"
                />
              </div>

              {/* Loại phòng (optional) */}
              <div className="ar-search-field" ref={typeDropRef} style={{ position: "relative" }}>
                <label>LOẠI PHÒNG (TÙY CHỌN)</label>
                <button
                  type="button"
                  className="ar-search-drop-btn"
                  onClick={() => setTypeDropOpen(p => !p)}
                >
                  <span>{searchType || "Tất cả loại"}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: typeDropOpen ? "rotate(180deg)" : "none", transition: "0.2s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {typeDropOpen && (
                  <div className="ar-filter-dropdown">
                    <div className={`ar-filter-option${searchType === "" ? " active" : ""}`} onClick={() => { setSearchType(""); setTypeDropOpen(false); }}>
                      Tất cả loại phòng
                    </div>
                    {roomTypes.map(type => (
                      <div key={type} className={`ar-filter-option${searchType === type ? " active" : ""}`} onClick={() => { setSearchType(type); setTypeDropOpen(false); }}>
                        {searchType === type && <span className="ar-check">✓</span>}
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút tìm */}
              <button
                className="ar-search-btn"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? "Đang tìm..." : "🔍 Tìm phòng trống"}
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
            <p>Đang tải danh sách phòng...</p>
          </div>
        ) : searching ? (
          <div className="ar-loading">
            <div className="bbhh-spinner" />
            <p>Đang tìm phòng trống...</p>
          </div>
        ) : currentRooms.length === 0 ? (
          <div className="ar-empty">
            <div className="ar-empty-icon">🛏️</div>
            <h3>{isSearchMode ? "Không có phòng trống" : "Không tìm thấy phòng"}</h3>
            <p>{isSearchMode ? "Hãy thử chọn ngày khác hoặc loại phòng khác." : "Hãy thử chọn loại phòng khác."}</p>
            <button className="btn-gold" onClick={resetSearch}>Xem tất cả phòng</button>
          </div>
        ) : (
          <>
            {/* Badge thông báo đang filter */}
            {isSearchMode && (
              <div className="ar-mode-badge">
                Hiện có {filteredRooms.length} phòng còn trống từ {formatDate(checkIn)} đến {formatDate(checkOut)}
                <button onClick={resetSearch}>Xem tất cả →</button>
              </div>
            )}

            <div className="ar-grid">
              {currentRooms.map(room => (
                <div key={room.id} className="ar-card" onClick={() => navigate(`/room-details-book/${room.id}`)}>
                  <div className="ar-card-img">
                    <img src={room.roomPhotoUrl} alt={room.roomType} />
                    <span className="ar-card-type">{room.roomType}</span>
                    {isSearchMode && (
                      <span className="ar-available-badge">✓ Còn phòng</span>
                    )}
                  </div>
                  <div className="ar-card-body">
                    <h3 className="ar-card-title">{room.roomType}</h3>
                    <p className="ar-card-desc">{room.roomDescription}</p>
                    <div className="ar-card-amenities">
                      <span>📶 WiFi</span>
                      <span>❄️ Điều hòa</span>
                      <span>🏊 Hồ bơi</span>
                    </div>
                    <div className="ar-card-footer">
                      <div className="ar-card-price">
                        <span className="ar-price-num">{room.roomPrice?.toLocaleString("vi-VN")}$</span>
                        <span className="ar-price-per">/ đêm</span>
                      </div>
                      <button
                        className="ar-card-btn"
                        onClick={e => { e.stopPropagation(); navigate(`/room-details-book/${room.id}`); }}
                      >
                        Đặt ngay
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
