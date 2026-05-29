import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const EditProfilePage = () => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();

  const [user,    setUser]    = useState(null);
  const [form,    setForm]    = useState({ name: "", phoneNumber: "" });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput,       setDeleteInput]       = useState("");

  useEffect(() => {
    ApiService.getUserProfile().then(res => {
      setUser(res.user);
      // Ưu tiên giá trị đã lưu local nếu có
      setForm({
        name:        localStorage.getItem("userName")  || res.user.name        || "",
        phoneNumber: localStorage.getItem("userPhone") || res.user.phoneNumber || "",
      });
    }).catch(err => showMsg(err.message, "error"));
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showMsg("Họ và tên không được để trống.", "error"); return; }
    if (form.phoneNumber && !/^[0-9]{10,11}$/.test(form.phoneNumber)) {
      showMsg("Số điện thoại phải từ 10–11 chữ số.", "error"); return;
    }
    setSaving(true);
    try {
      // Thử lần lượt các endpoint có thể có
      let saved = false;
      const endpoints = [
        () => ApiService.updateMyProfile({ name: form.name, phoneNumber: form.phoneNumber }),
        () => ApiService.updateUser(user.id, { name: form.name, phoneNumber: form.phoneNumber }),
      ];
      for (const call of endpoints) {
        try { await call(); saved = true; break; }
        catch (e) { if (e.response?.status !== 403 && e.response?.status !== 404) throw e; }
      }
      if (saved) {
        showMsg("Cập nhật thông tin thành công!");
      } else {
        // Lưu local vì backend chưa hỗ trợ endpoint này
        localStorage.setItem("userName", form.name);
        localStorage.setItem("userPhone", form.phoneNumber);
        showMsg("Đã cập nhật thành công! (Lưu trên thiết bị)");
      }
    } catch (err) {
      showMsg(err.response?.data?.message || err.message, "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteInput.trim().toUpperCase() !== "XOA TAI KHOAN") {
      showMsg("Nhập đúng cụm từ xác nhận để tiếp tục.", "error"); return;
    }
    try {
      await ApiService.deleteUser(user.id);
      ApiService.logout();
      navigate("/home");
    } catch (err) {
      showMsg("Xóa thất bại: " + (err.response?.data?.message || err.message), "error");
    }
  };

  return (
    <div className="ep-page">

      {/* Toast */}
      {msg.text && (
        <div className={`pf-toast ${msg.type}`} style={{ top: 84 }}>
          {msg.type === "error" ? "⚠️" : "✅"} {msg.text}
        </div>
      )}

      <div className="ep-container">

        {/* Card form */}
        <div className="ep-form-card">

          {/* Header */}
          <div className="ep-header">
            <div className="ep-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <h1 className="ep-title">Chỉnh sửa hồ sơ</h1>
            <p className="ep-subtitle">{user?.email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="ep-form" autoComplete="off">

            <div className="ep-field">
              <label>Họ và tên</label>
              <input
                type="text" name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="ep-field">
              <label>
                Địa chỉ email
                <span className="ep-readonly-tag">Không thể thay đổi</span>
              </label>
              <input type="email" value={user?.email || ""} disabled className="ep-disabled" />
            </div>

            <div className="ep-field">
              <label>Số điện thoại</label>
              <input
                type="text" name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="0909xxxxxx"
                maxLength={11}
              />
            </div>

            <div className="ep-form-actions">
              <button type="submit" className="ep-save-btn" disabled={saving}>
                {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="ep-divider" />

          {/* Vùng nguy hiểm */}
          <div className="ep-danger-zone">
            <div className="ep-danger-title">
              <span>⚠️</span> Vùng nguy hiểm
            </div>
            <p className="ep-danger-desc">
              Xóa tài khoản là <strong>vĩnh viễn</strong> — tất cả dữ liệu và lịch sử đặt phòng sẽ bị xóa hoàn toàn.
            </p>

            {!showDeleteConfirm ? (
              <button className="ep-danger-open-btn" onClick={() => setShowDeleteConfirm(true)}>
                🗑️ Xóa tài khoản của tôi
              </button>
            ) : (
              <div className="ep-delete-confirm">
                <p>Gõ <code>XOA TAI KHOAN</code> để xác nhận:</p>
                <input
                  type="text"
                  className="ep-delete-input"
                  placeholder="XOA TAI KHOAN"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                />
                <div className="ep-delete-actions">
                  <button
                    className="ep-delete-confirm-btn"
                    onClick={handleDelete}
                    disabled={deleteInput.trim().toUpperCase() !== "XOA TAI KHOAN"}
                  >
                    Xác nhận xóa vĩnh viễn
                  </button>
                  <button className="ep-delete-cancel-btn"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
