import React, { useState } from "react";
import ApiService from "../../service/ApiService";
import { useTranslation } from "react-i18next";

const ForgotPasswordPage = () => {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert(t("forgotPassword.enterEmail"));

      return;
    }

    try {
      setLoading(true);

      const response = await ApiService.forgotPassword(email);

      alert(response.data.message);

      window.location.href = "/reset-password";
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || t("forgotPassword.sendOtpFailed"));
      } else {
        alert(t("forgotPassword.serverError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#fff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#333",
          }}
        >
          {t("forgotPassword.title")}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            marginBottom: "25px",
            fontSize: "14px",
          }}
        >
          {t("forgotPassword.description")}
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            placeholder={t("forgotPassword.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#007bff",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {loading
              ? t("forgotPassword.sendingOtp")
              : t("forgotPassword.sendOtp")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
