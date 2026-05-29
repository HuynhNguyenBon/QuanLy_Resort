import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email."); 
      return;
    }
    
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ApiService.forgotPassword(email);
      setSuccess("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
      setTimeout(() => navigate("/reset-password"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Không tìm thấy tài khoản với email này.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">★ BBHH Resort</div>
          <h2 className="auth-left-title">Quên mật khẩu?</h2>
          <p className="auth-left-sub">Đừng lo! Chúng tôi sẽ gửi mã OTP đến email để bạn đặt lại mật khẩu.</p>
          <div className="auth-features">
            <div className="auth-feature-item"><span>📧</span> Nhận OTP qua email</div>
            <div className="auth-feature-item"><span>🔐</span> Đặt lại mật khẩu an toàn</div>
            <div className="auth-feature-item"><span>⚡</span> Xong trong vài phút</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-icon">🔑</div>
          <h2 className="auth-form-title">Khôi phục mật khẩu</h2>
          <p className="auth-form-sub">Nhập email để nhận mã OTP xác nhận</p>

          {error   && <div className="auth-error">  <span>⚠️</span>{error}</div>}
          {success && <div className="auth-success"><span>✅</span>{success}</div>}

          {/* ĐÃ THÊM THUỘC TÍNH noValidate TẠI ĐÂY */}
          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="auth-field">
              <label>Địa chỉ email</label>
              <input
                type="email"
                placeholder="ten@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
            </button>
          </form>

          <p className="auth-switch">
            <a href="/login">← Quay lại đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
