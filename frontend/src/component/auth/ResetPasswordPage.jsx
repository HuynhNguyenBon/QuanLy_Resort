import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useTranslation } from "react-i18next";
import "../../UiverseElements.css";

const ResetPasswordPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra bỏ trống
    if (!form.email.trim() || !form.otp.trim() || !form.newPassword.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    // 2. Kiểm tra định dạng Email (Đuôi từ 2 đến 4 ký tự)
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không đúng định dạng.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    // 3. ĐÃ THÊM: Kiểm tra độ mạnh mật khẩu (Giống hệt trang Đăng ký)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(form.newPassword)) {
      setError("Mật khẩu ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await ApiService.resetPassword(
        form.email,
        form.otp,
        form.newPassword
      );

      setSuccess(response.data?.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || t("resetPassword.resetFailed"));
      } else {
        setError(t("forgotPassword.serverError") || "Đã xảy ra lỗi, vui lòng thử lại.");
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
          <h2 className="auth-left-title">Tạo mật khẩu mới</h2>
          <p className="auth-left-sub">Chỉ còn một bước nữa! Vui lòng nhập mã OTP và thiết lập mật khẩu mới của bạn.</p>
          <div className="auth-features">
            <div className="auth-feature-item"><span>🛡️</span> Bảo mật tài khoản cao</div>
            <div className="auth-feature-item"><span>🚀</span> Hoàn tất nhanh chóng</div>
            <div className="auth-feature-item"><span>✨</span> Trải nghiệm liền mạch</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-icon">🔒</div>
          <h2 className="auth-form-title">{t("resetPassword.title") || "Đặt lại mật khẩu"}</h2>
          <p className="auth-form-sub">Nhập thông tin để hoàn tất</p>

          {error   && <div className="auth-error">  <span>⚠️</span>{error}</div>}
          {success && <div className="auth-success"><span>✅</span>{success}</div>}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder={t("resetPassword.emailPlaceholder") || "example@email.com"}
                value={form.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <div className="auth-field">
              <label>Mã OTP</label>
              <input
                type="text"
                name="otp"
                placeholder={t("resetPassword.otpPlaceholder") || "Nhập mã OTP (VD: 123456)"}
                value={form.otp}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <div className="auth-field">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Tối thiểu 6 ký tự"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {/* ĐÃ THÊM: Gợi ý định dạng mật khẩu bên dưới input */}
              <p className="auth-hint">Gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)</p>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (t("resetPassword.resetting") || "Đang xử lý...") : (t("resetPassword.title") || "Đặt lại mật khẩu")}
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

export default ResetPasswordPage;
