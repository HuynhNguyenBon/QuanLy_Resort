import "../../UiverseElements.css";
import React, { useState } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, password, phoneNumber } = formData;

    // 1. Kiểm tra bỏ trống
    if (!name || !email || !password || !phoneNumber) {
      setErrorMessage(t("register.fillAllFields"));
      return false;
    }

    // 2. Kiểm tra định dạng Email (Phải có @ và dấu chấm)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(t("validation.invalidEmail"));
      return false;
    }

    // 3. Kiểm tra độ dài mật khẩu (Ít nhất 6 ký tự)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
      setErrorMessage(t("validation.invalidPassword"));
      return false;
    }

    // 4. Kiểm tra định dạng số điện thoại (Chỉ chứa số, từ 10 đến 11 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage(t("validation.invalidPhone"));
      return false;
    }

    return true; // Nếu vượt qua hết các bài test trên thì cho phép đi tiếp
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gọi hàm kiểm tra, nếu false thì dừng lại ngay và tự tắt lỗi sau 5 giây
    if (!validateForm()) {
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      // Gọi phương thức đăng ký từ ApiService
      const response = await ApiService.registerUser(formData);

      // Kiểm tra xem phản hồi có thành công không
      if (response.statusCode === 200) {
        // Xóa các trường form sau khi đăng ký thành công
        setFormData({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
        });
        setSuccessMessage(t("register.success"));
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/login"); // Chuyển thẳng về trang đăng nhập cho tiện
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(t("register.error"));
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return (
    <div className="auth-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <h2>{t("register.title")}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t("register.name")}:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("login.email")}:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("register.phone")}:</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t("login.password")}:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn-uiverse" disabled={isLoading}>
          {isLoading ? t("register.loading") : t("register.title")}
          {isLoading && <div className="loader-uiverse"></div>}
        </button>
      </form>
      <p className="register-link">
        {t("register.alreadyAccount")} <a href="/login">{t("login.title")}</a>
      </p>
    </div>
  );
}

export default RegisterPage;
