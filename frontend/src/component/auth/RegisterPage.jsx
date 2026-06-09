import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { resolveApiError } from "../../utils/apiErrorMap";
import "../../UiverseElements.css";

function RegisterPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { name, email, password, phoneNumber } = formData;
    if (!name || !email || !password || !phoneNumber) {
      setError(t("login.fillAllFields"));
      return false;
    }
    if (
      !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(email) ||
      email.includes("..")
    ) {
      setError(t("validation.invalidEmail"));
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
      setError(t("validation.invalidPhone"));
      return false;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
        password,
      )
    ) {
      setError(t("validation.invalidPassword"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setTimeout(() => setError(""), 5000);
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.registerUser(formData);
      if (res.statusCode === 200) {
        setSuccess(t("register.success"));
        const registeredEmail = formData.email;
        setFormData({ name: "", email: "", password: "", phoneNumber: "" });
        // Lưu lại email để nếu người dùng rời trang xác minh (về trang chủ, mở link email...)
        // rồi quay lại "/verify-email", trang vẫn biết email cần xác minh là gì.
        sessionStorage.setItem("pendingVerifyEmail", registeredEmail);
        setTimeout(
          () =>
            navigate("/verify-email", { state: { email: registeredEmail } }),
          2500,
        );
      }
    } catch (err) {
      setError(
        resolveApiError(err.response?.data?.message, t, "register.failed"),
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
          <h2 className="auth-left-title">{t("register.heroTitle")}</h2>
          <p className="auth-left-sub">{t("register.heroSub")}</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span>🛏️</span> {t("register.feature1")}
            </div>
            <div className="auth-feature-item">
              <span>🎁</span> {t("register.feature2")}
            </div>
            <div className="auth-feature-item">
              <span>📅</span> {t("register.feature3")}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">{t("register.title")}</h2>
          <p className="auth-form-sub">{t("register.subtitle")}</p>

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
              <label>{t("register.name")}</label>
              <input
                type="text"
                name="name"
                placeholder={t("register.namePlaceholder")}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="auth-field">
              <label>{t("register.email")}</label>
              <input
                type="email"
                name="email"
                placeholder={t("register.emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="auth-field">
              <label>{t("register.phone")}</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder={t("register.phonePlaceholder")}
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength={11}
              />
            </div>
            <div className="auth-field">
              <label>{t("register.password")}</label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder={t("register.passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="auth-hint">{t("register.passwordHint")}</p>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? t("register.loading") : t("register.submit")}
            </button>
          </form>

          <p className="auth-switch">
            {t("register.alreadyAccount")}{" "}
            <a href="/login">{t("register.loginLink")}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
