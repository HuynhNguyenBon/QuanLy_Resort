import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const ForgotPasswordPage = () => {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t("forgotPassword.enterEmail"));
      return;
    }
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError(t("validation.invalidEmail"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await ApiService.forgotPassword(email);
      setSuccess(t("forgotPassword.successMsg"));
      setTimeout(() => navigate("/reset-password"), 2500);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setError(t("forgotPassword.timeout", "Hệ thống phản hồi quá lâu, vui lòng thử lại sau ít phút."));
      } else {
        setError(err.response?.data?.message || t("forgotPassword.notFound"));
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
          <h2 className="auth-left-title">{t("forgotPassword.heroTitle")}</h2>
          <p className="auth-left-sub">{t("forgotPassword.heroSub")}</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>📧</span> {t("forgotPassword.feature1")}
            </div>
            <div className="auth-feature-item">
              <span>🔐</span> {t("forgotPassword.feature2")}
            </div>
            <div className="auth-feature-item">
              <span>⚡</span> {t("forgotPassword.feature3")}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-icon">🔑</div>
          <h2 className="auth-form-title">{t("forgotPassword.title")}</h2>
          <p className="auth-form-sub">{t("forgotPassword.description")}</p>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-success">
              <span>✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="auth-field">
              <label>{t("login.email")}</label>
              <input
                type="email"
                placeholder={t("forgotPassword.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? t("forgotPassword.sendingOtp")
                : t("forgotPassword.sendOtp")}
            </button>
          </form>

          <p className="auth-switch">
            <a href="/login">{t("forgotPassword.backToLogin")}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
