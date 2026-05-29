import React, { useState, useRef, useEffect } from "react";
import "../../UiverseElements.css";

const Pagination = ({ roomsPerPage, totalRooms, currentPage, paginate }) => {
  const totalPages = Math.ceil(totalRooms / roomsPerPage);
  const [jumpOpen, setJumpOpen] = useState(null); // "left" | "right" | null
  const [jumpInput, setJumpInput] = useState("");
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setJumpOpen(null);
        setJumpInput("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (totalPages <= 1) return null;

  // Tính range trang hiển thị
  const getPages = () => {
    const pages = [];
    const delta = 2;
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd   = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (rangeStart > 2)            pages.push("left-dots");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push("right-dots");
    if (totalPages > 1)            pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  // Nhảy tới trang khi nhập số
  const handleJump = (e) => {
    if (e.key === "Enter") {
      const n = parseInt(jumpInput, 10);
      if (n >= 1 && n <= totalPages) {
        paginate(n);
        setJumpOpen(null);
        setJumpInput("");
      }
    }
  };

  // Các trang ẩn bên trái dots
  const leftHidden  = Array.from({ length: Math.max(0, (currentPage - 2) - 2) }, (_, i) => i + 2);
  // Các trang ẩn bên phải dots
  const rightHidden = Array.from({ length: Math.max(0, (totalPages - 1) - (currentPage + 2)) }, (_, i) => currentPage + 3 + i);

  return (
    <nav className="pagination-nav" ref={dropRef}>
      <ul className="pagination-ul">

        {/* Prev */}
        <li>
          <button
            className="pagination-button pagination-arrow"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >‹</button>
        </li>

        {pages.map((page, i) => {
          if (page === "left-dots") {
            return (
              <li key="left-dots" style={{ position: "relative" }}>
                <button
                  className={`pagination-button pagination-dots-btn${jumpOpen === "left" ? " active" : ""}`}
                  onClick={() => { setJumpOpen(jumpOpen === "left" ? null : "left"); setJumpInput(""); }}
                >···</button>
                {jumpOpen === "left" && (
                  <div className="pagination-jump-menu">
                    <div className="pagination-jump-input-wrap">
                      <input
                        className="pagination-jump-input"
                        type="number"
                        min={2}
                        max={currentPage - 1}
                        placeholder="Trang..."
                        value={jumpInput}
                        onChange={e => setJumpInput(e.target.value)}
                        onKeyDown={handleJump}
                        autoFocus
                      />
                    </div>
                    <div className="pagination-jump-list">
                      {leftHidden.slice(-8).map(p => (
                        <div
                          key={p}
                          className="pagination-jump-item"
                          onClick={() => { paginate(p); setJumpOpen(null); }}
                        >{p}</div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          }

          if (page === "right-dots") {
            return (
              <li key="right-dots" style={{ position: "relative" }}>
                <button
                  className={`pagination-button pagination-dots-btn${jumpOpen === "right" ? " active" : ""}`}
                  onClick={() => { setJumpOpen(jumpOpen === "right" ? null : "right"); setJumpInput(""); }}
                >···</button>
                {jumpOpen === "right" && (
                  <div className="pagination-jump-menu">
                    <div className="pagination-jump-input-wrap">
                      <input
                        className="pagination-jump-input"
                        type="number"
                        min={currentPage + 1}
                        max={totalPages - 1}
                        placeholder="Trang..."
                        value={jumpInput}
                        onChange={e => setJumpInput(e.target.value)}
                        onKeyDown={handleJump}
                        autoFocus
                      />
                    </div>
                    <div className="pagination-jump-list">
                      {rightHidden.slice(0, 8).map(p => (
                        <div
                          key={p}
                          className="pagination-jump-item"
                          onClick={() => { paginate(p); setJumpOpen(null); }}
                        >{p}</div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          }

          return (
            <li key={page}>
              <button
                className={`pagination-button${currentPage === page ? " current-page" : ""}`}
                onClick={() => paginate(page)}
              >{page}</button>
            </li>
          );
        })}

        {/* Next */}
        <li>
          <button
            className="pagination-button pagination-arrow"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >›</button>
        </li>

      </ul>
    </nav>
  );
};

export default Pagination;
