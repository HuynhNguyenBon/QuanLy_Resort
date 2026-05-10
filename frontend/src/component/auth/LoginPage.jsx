import "../../UiverseElements.css";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useTranslation } from "react-i18next";

function LoginPage() {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t("login.fillAllFields"));

      setTimeout(() => setError(""), 5000);

      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.loginUser({
        email,
        password,
      });

      if (response.statusCode === 200) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.role);

        navigate(from, { replace: true });
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);

      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{t("login.title")}</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>

          <input
            type="email"
            className="input-uiverse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("login.password")}</label>

          <input
            type="password"
            className="input-uiverse"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-uiverse" disabled={isLoading}>
          {isLoading ? t("login.loading") : t("login.title")}

          {isLoading && <div className="loader-uiverse"></div>}
        </button>
      </form>

      <div style={{ marginTop: "15px" }}>
        <div
          style={{
            textAlign: "right",
            marginBottom: "10px",
            paddingRight: "20px",
          }}
        >
          <a
            href="/forgot-password"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            {t("login.forgotPassword")}
          </a>
        </div>

        <p
          className="register-link"
          style={{
            margin: 0,
            textAlign: "left",
          }}
        >
          {t("login.noAccount")}

          <a href="/register">{t("register.title")}</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
