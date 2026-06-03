import React, { useState, useEffect } from "react";

const ScrollToTopBtn = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="scroll-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
    >
      <i className="bi bi-chevron-up" />
    </button>
  );
};

export default ScrollToTopBtn;
