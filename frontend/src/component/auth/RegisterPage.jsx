import "../../UiverseElements.css";
import React, { useState } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const { t } = useTranslation("auth");

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { name, email, password, phoneNumber } = formData;

    if (!name || !email || !password || !phoneNumber) {
      setErrorMessage(t("login.fillAllFields"));

      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrorMessage(t("validation.invalidEmail"));

      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
      setErrorMessage(t("validation.invalidPassword"));

      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;

    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage(t("validation.invalidPhone"));

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => setErrorMessage(""), 5000);

      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.registerUser(formData);

      if (response.statusCode === 200) {
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
        });

        setSuccessMessage(t("register.success"));

        setTimeout(() => {
          setSuccessMessage("");

          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);

      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {successMessage && <p className="success-message">{successMessage}</p>}

      <h2>{t("register.title")}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t("register.name")}</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("register.phone")}</label>

          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("login.password")}</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="btn-uiverse" disabled={isLoading}>
          {isLoading ? t("login.loading") : t("register.title")}

          {isLoading && <div className="loader-uiverse"></div>}
        </button>
      </form>

      <p className="register-link">
        {t("register.alreadyAccount")}

        <a href="/login">{t("login.title")}</a>
      </p>
    </div>
  );
}

export default RegisterPage;
