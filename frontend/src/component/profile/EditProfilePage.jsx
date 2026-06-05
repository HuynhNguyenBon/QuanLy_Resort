import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import "../../UiverseElements.css";

const EditProfilePage = () => {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const confirmKeyword = t("confirmKeyword", {
    defaultValue: "XOA TAI KHOAN",
  });

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", phoneNumber: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    ApiService.getUserProfile()
      .then((res) => {
        setUser(res.user);
        // Ưu tiên giá trị đã lưu local nếu có
        setForm({
          name: localStorage.getItem("userName") || res.user.name || "",
          phoneNumber:
            localStorage.getItem("userPhone") || res.user.phoneNumber || "",
        });
      })
      .catch((err) => showMsg(err.message, "error"));
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showMsg(t("nameRequired"), "error");
      return;
    }

    if (form.phoneNumber && !/^[0-9]{10,11}$/.test(form.phoneNumber)) {
      showMsg(t("phoneInvalid"), "error");
      return;
    }
    setSaving(true);
    try {
      // Thử lần lượt các endpoint có thể có
      await ApiService.updateUser(user.id, {
        name: form.name,
        phoneNumber: form.phoneNumber,
      });

      showMsg(t("updateSuccess"));
    } catch (err) {
      showMsg(err.response?.data?.message || err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteInput.trim().toUpperCase() !== confirmKeyword.toUpperCase()) {
      showMsg(t("deleteKeywordInvalid"), "error");
      return;
    }
    try {
      await ApiService.deleteUser(user.id);
      ApiService.logout();
      navigate("/home");
    } catch (err) {
      showMsg(
        `${t("deleteFailed")}: ${err.response?.data?.message || err.message}`,
        "error",
      );
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
            <div className="ep-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h1 className="ep-title">{t("editProfile")}</h1>
            <p className="ep-subtitle">{user?.email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="ep-form" autoComplete="off">
            <div className="ep-field">
              <label>{t("fullName")}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t("infullName")}
              />
            </div>

            <div className="ep-field">
              <label>
                {t("emailAddress")}{" "}
                <span className="ep-readonly-tag">{t("notEmail")}</span>
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="ep-disabled"
              />
            </div>

            <div className="ep-field">
              <label>{t("phoneNumber")}</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="0909xxxxxx"
                maxLength={11}
              />
            </div>

            <div className="ep-form-actions">
              <button type="submit" className="ep-save-btn" disabled={saving}>
                {saving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="ep-divider" />

          {/* Vùng nguy hiểm */}
          <div className="ep-danger-zone">
            <div className="ep-danger-title">{t("zone")}</div>
            <p className="ep-danger-desc">{t("warning")}</p>

            {!showDeleteConfirm ? (
              <button
                className="ep-danger-open-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                {t("deleteAccount")}
              </button>
            ) : (
              <div className="ep-delete-confirm">
                <p>
                  {t("confirmText", {
                    text: confirmKeyword,
                  })}
                </p>
                <input
                  type="text"
                  className="ep-delete-input"
                  placeholder={confirmKeyword}
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                />
                <div className="ep-delete-actions">
                  <button
                    className="ep-delete-confirm-btn"
                    onClick={handleDelete}
                    disabled={
                      deleteInput.trim().toUpperCase() !==
                      confirmKeyword.toUpperCase()
                    }
                  >
                    {t("confirmDelete")}
                  </button>
                  <button
                    className="ep-delete-cancel-btn"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput("");
                    }}
                  >
                    {t("cancel")}
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
