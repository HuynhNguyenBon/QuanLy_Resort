import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

function RegisterPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phoneNumber: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { name, email, password, phoneNumber } = formData;
  
    if (!name || !email || !password || !phoneNumber) {
      setError("Vui lòng điền đầy đủ thông tin."); 
      return false;
    }
    
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(email)) {
      setError("Email không đúng định dạng."); 
      return false;
    }
    if (email.includes("..")) {
      setError("Email không đúng định dạng.");
      return false;
    }

    if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
      setError("Số điện thoại phải từ 10–11 chữ số."); 
      return false;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password)) {
      setError("Mật khẩu ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."); 
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
        setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
        setFormData({ name: "", email: "", password: "", phoneNumber: "" });
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
          <h2 className="auth-left-title">Tham gia cùng chúng tôi</h2>
          <p className="auth-left-sub">Tạo tài khoản để nhận ưu đãi độc quyền và trải nghiệm dịch vụ 5 sao.</p>
          <div className="auth-features">
            <div className="auth-feature-item"><span>🎁</span> Ưu đãi thành viên mới</div>
            <div className="auth-feature-item"><span>📅</span> Quản lý đặt phòng dễ dàng</div>
            <div className="auth-feature-item"><span>🔔</span> Nhận thông báo khuyến mãi</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Tạo tài khoản</h2>
          <p className="auth-form-sub">Điền thông tin để bắt đầu</p>

          {/* Khối hiển thị thông báo lỗi / thành công dạng hộp */}
          {error   && <div className="auth-error"> <span>⚠️</span>{error}</div>}
          {success && <div className="auth-success"><span>✅</span>{success}</div>}

          {/* ĐÃ THÊM THUỘC TÍNH noValidate TẠI ĐÂY */}
          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="auth-field">
              <label>Họ và tên</label>
              <input type="text" name="name" placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="auth-field">
              <label>Email</label>
              <input type="email" name="email" placeholder="ten@gmail.com" value={formData.email} onChange={handleChange} />
            </div>
            
            <div className="auth-field">
              <label>Số điện thoại</label>
              <input type="text" name="phoneNumber" placeholder="0909xxxxxx" value={formData.phoneNumber} onChange={handleChange} maxLength={11} />
            </div>
            
            <div className="auth-field">
              <label>Mật khẩu</label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="auth-hint">Gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)</p>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <a href="/login">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
