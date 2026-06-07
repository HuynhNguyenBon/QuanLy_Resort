import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <div className="nf-card">
        <div className="nf-code">404</div>
        <div className="nf-wave">🌊</div>
        <h1 className="nf-title">Trang không tồn tại</h1>
        <p className="nf-sub">
          Xin lỗi, trang bạn tìm kiếm đã bị dời đi hoặc không tồn tại.
          <br />
          Hãy quay về trang chủ để tiếp tục khám phá BBHH Resort.
        </p>
        <div className="nf-btns">
          <button className="nf-btn-primary" onClick={() => navigate("/home")}>
            🏠 Về trang chủ
          </button>
          <button className="nf-btn-secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>
      </div>
      <div className="nf-palms">🌴&nbsp;&nbsp;🌴</div>
    </div>
  );
};

export default NotFoundPage;
