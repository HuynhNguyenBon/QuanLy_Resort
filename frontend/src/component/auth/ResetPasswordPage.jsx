import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { resolveApiError } from "../../utils/apiErrorMap";
import "../../UiverseElements.css";

const ResetPasswordPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.otp.trim() || !form.newPassword.trim()) {
      setError(t("login.fillAllFields"));
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(form.email)) {
      setError(t("validation.invalidEmail"));
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
        form.newPassword,
      )
    ) {
      setError(t("validation.invalidPassword"));
      setTimeout(() => setError(""), 5000);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await ApiService.resetPassword(
        form.email,
        form.otp,
        form.newPassword,
      );
      setSuccess(response.data?.message || t("resetPassword.success"));
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        resolveApiError(
          err.response?.data?.message,
          t,
          "resetPassword.generalError",
        ),
      );
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
          <h2 className="auth-left-title">{t("resetPassword.heroTitle")}</h2>
          <p className="auth-left-sub">{t("resetPassword.heroSub")}</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>🛡️</span> {t("resetPassword.feature1")}
            </div>
            <div className="auth-feature-item">
              <span>🔑</span> {t("resetPassword.feature2")}
            </div>
            <div className="auth-feature-item">
              <span>⚡</span> {t("resetPassword.feature3")}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-icon">🔒</div>
          <h2 className="auth-form-title">{t("resetPassword.title")}</h2>
          <p className="auth-form-sub">{t("resetPassword.subtitle")}</p>

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
                name="email"
                placeholder={t("resetPassword.emailPlaceholder")}
                value={form.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div className="auth-field">
              <label>OTP</label>
              <input
                type="text"
                name="otp"
                placeholder={t("resetPassword.otpPlaceholder")}
                value={form.otp}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <div className="auth-field">
              <label>{t("login.password")}</label>
              <input
                type="password"
                name="newPassword"
                placeholder={t("resetPassword.passwordPlaceholder")}
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <p className="auth-hint">{t("resetPassword.passwordHint")}</p>
              <p className="auth-hint">{t("resetPassword.passwordHint2")}</p>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? t("resetPassword.resetting")
                : t("resetPassword.resetButton")}
            </button>
          </form>

          <p className="auth-switch">
            <a href="/login">{t("resetPassword.backToLogin")}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
