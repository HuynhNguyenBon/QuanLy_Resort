import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

function LoginPage() {
  const { t } = useTranslation("auth");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Kiểm tra nếu người dùng bỏ trống trường dữ liệu
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    // 2. KIỂM TRA ĐỊNH DẠNG EMAIL (THÊM MỚI Ở ĐÂY)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng.");
      setTimeout(() => setError(""), 4000); // Ẩn lỗi sau 4 giây
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.loginUser({ email, password });
      if (res.statusCode === 200) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        localStorage.setItem("userEmail", res.email || email);
        navigate(from, { replace: true });
      }
    } catch (err) {

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đăng nhập thất bại.");
      }
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
          <h2 className="auth-left-title">Chào mừng trở lại!</h2>
          <p className="auth-left-sub">Đăng nhập để đặt phòng, tra cứu booking và quản lý tài khoản của bạn.</p>
          <div className="auth-features">
            <div className="auth-feature-item"><span>🛏️</span> Đặt phòng nhanh chóng</div>
            <div className="auth-feature-item"><span>🔍</span> Tra cứu đặt phòng dễ dàng</div>
            <div className="auth-feature-item"><span>🎁</span> Ưu đãi dành riêng cho thành viên</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Đăng nhập</h2>
          <p className="auth-form-sub">Nhập thông tin tài khoản của bạn</p>
          
          {error && <div className="auth-error"><span>⚠️</span>{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="ten@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>Mật khẩu</label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-forgot">
              <a href="/forgot-password">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
