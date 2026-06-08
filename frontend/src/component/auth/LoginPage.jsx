import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

function LoginPage() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("login.fillAllFields"));
      setTimeout(() => setError(""), 4000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("login.invalidEmail"));
      setTimeout(() => setError(""), 4000);
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.loginUser({ email, password });
      if (res.statusCode === 200) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        localStorage.setItem("userEmail", res.email || email);
        const dest =
          res.role === "ADMIN"
            ? "/admin"
            : res.role === "STAFF"
              ? "/staff"
              : from;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || t("login.failed"));
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
          <h2 className="auth-left-title">{t("login.heroTitle")}</h2>
          <p className="auth-left-sub">{t("login.heroSub")}</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>🛏️</span> {t("login.feature1")}
            </div>
            <div className="auth-feature-item">
              <span>🔍</span> {t("login.feature2")}
            </div>
            <div className="auth-feature-item">
              <span>🎁</span> {t("login.feature3")}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">{t("login.title")}</h2>
          <p className="auth-form-sub">{t("login.subtitle")}</p>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="auth-field">
              <label>{t("login.email")}</label>
              <input
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>{t("login.password")}</label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-forgot">
              <a href="/forgot-password">{t("login.forgotPassword")}</a>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? t("login.loading") : t("login.submit")}
            </button>
          </form>

          <p className="auth-switch">
            {t("login.noAccount")}{" "}
            <a href="/register">{t("login.registerLink")}</a>
          </p>

          <p className="auth-switch">
            {t("login.notVerifiedEmail")}{" "}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() =>
                navigate("/verify-email", { state: { email } })
              }
            >
              {t("login.enterOtpLink")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
