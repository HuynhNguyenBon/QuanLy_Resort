import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { resolveApiError } from "../../utils/apiErrorMap";
import "../../UiverseElements.css";

const VerifyEmailPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email:
      location.state?.email ||
      sessionStorage.getItem("pendingVerifyEmail") ||
      "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.otp.trim()) {
      setError(t("verifyEmail.enterOtp"));
      setTimeout(() => setError(""), 4000);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await ApiService.verifyEmail(form.email, form.otp);
      setSuccess(response.data?.message || t("verifyEmail.success"));
      sessionStorage.removeItem("pendingVerifyEmail");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        resolveApiError(
          err.response?.data?.message,
          t,
          "verifyEmail.generalError",
        ),
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!form.email.trim()) {
      setError(t("verifyEmail.enterOtp"));
      setTimeout(() => setError(""), 4000);
      return;
    }
    try {
      setResending(true);
      setError("");
      const response = await ApiService.resendVerificationOtp(form.email);
      setSuccess(response.data?.message || t("verifyEmail.resendSuccess"));
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(
        resolveApiError(
          err.response?.data?.message,
          t,
          "verifyEmail.generalError",
        ),
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">★ BBHH Resort</div>
          <h2 className="auth-left-title">{t("verifyEmail.heroTitle")}</h2>
          <p className="auth-left-sub">{t("verifyEmail.heroSub")}</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>🛡️</span> {t("verifyEmail.feature1")}
            </div>
            <div className="auth-feature-item">
              <span>📧</span> {t("verifyEmail.feature2")}
            </div>
            <div className="auth-feature-item">
              <span>⚡</span> {t("verifyEmail.feature3")}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-icon">✅</div>
          <h2 className="auth-form-title">{t("verifyEmail.title")}</h2>
          <p className="auth-form-sub">{t("verifyEmail.subtitle")}</p>

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
                placeholder={t("verifyEmail.emailPlaceholder")}
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
                placeholder={t("verifyEmail.otpPlaceholder")}
                value={form.otp}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? t("verifyEmail.verifying")
                : t("verifyEmail.verifyButton")}
            </button>
          </form>

          <p className="auth-switch">
            <button
              type="button"
              className="auth-link-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending
                ? t("verifyEmail.resending")
                : t("verifyEmail.resendButton")}
            </button>
          </p>

          <p className="auth-switch">
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => navigate("/login")}
            >
              {t("verifyEmail.backToLogin")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
