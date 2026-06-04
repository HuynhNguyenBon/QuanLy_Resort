import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";

/* ─── Toast Component ──────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  const isError = type === "error";

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastProgressError   { from { width:100%; } to { width:0%; } }
        @keyframes toastProgressSuccess { from { width:100%; } to { width:0%; } }
        .phong-toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          min-width: 300px; max-width: 420px;
          display: flex; align-items: flex-start; gap: 12px;
          padding: 16px 18px; border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.14);
          font-size: 14px; line-height: 1.5;
          animation: toastSlideIn 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards;
          overflow: hidden;
        }
        .phong-toast.error   { background:#fff1f0; border:1px solid #ffa39e; color:#a8071a; }
        .phong-toast.success { background:#f6ffed; border:1px solid #95de64; color:#237804; }
        .phong-toast__icon  { font-size:20px; flex-shrink:0; margin-top:1px; }
        .phong-toast__body  { flex:1; }
        .phong-toast__title { font-weight:600; font-size:14px; margin-bottom:2px; }
        .phong-toast__msg   { font-size:13px; opacity:0.85; }
        .phong-toast__close {
          background:none; border:none; cursor:pointer;
          font-size:16px; opacity:0.5; padding:0; color:inherit; flex-shrink:0;
        }
        .phong-toast__close:hover { opacity:1; }
        .phong-toast__bar {
          position:absolute; bottom:0; left:0; height:3px; border-radius:0 0 12px 12px;
        }
        .phong-toast.error   .phong-toast__bar { background:#ff4d4f; animation: toastProgressError   5s linear forwards; }
        .phong-toast.success .phong-toast__bar { background:#52c41a; animation: toastProgressSuccess 3s linear forwards; }
      `}</style>
      <div className={`phong-toast ${type}`}>
        <span className="phong-toast__icon">{isError ? "⚠️" : "✅"}</span>
        <div className="phong-toast__body">
          <div className="phong-toast__title">
            {isError ? "Lỗi" : "Thành công"}
          </div>
          <div className="phong-toast__msg">{message}</div>
        </div>
        <button className="phong-toast__close" onClick={onClose}>
          ✕
        </button>
        <div className="phong-toast__bar" />
      </div>
    </>
  );
};

/* ─── EditRoomPage ─────────────────────────────────────────────────────── */
const EditRoomPage = () => {
  const { t } = useTranslation("adminPanel");
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState({
    roomPhotoUrl: "",
    roomType: "",
    roomPrice: "",
    roomDescription: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  const showToast = (type, message, duration) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ type, message });
    const ms = duration || (type === "error" ? 5000 : 3000);
    const timer = setTimeout(() => setToast(null), ms);
    setToastTimer(timer);
  };

  const dismissToast = () => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast(null);
  };

  /* parse backend / network errors into readable Vietnamese messages */
  const parseError = (err) => {
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
    if (err.response?.status === 400)
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    if (err.response?.status === 403)
      return "Bạn không có quyền thực hiện thao tác này.";
    if (err.response?.status === 404) return "Không tìm thấy phòng này.";
    if (err.response?.status === 500)
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    if (err.message === "Network Error")
      return "Mất kết nối mạng. Vui lòng kiểm tra lại.";
    return err.message || "Đã xảy ra lỗi không xác định.";
  };

  /* fetch room details + existing translations on mount */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails({
          roomPhotoUrl: response.room.roomPhotoUrl,
          roomType: response.room.roomType,
          roomPrice: response.room.roomPrice,
          roomDescription: response.room.roomDescription,
        });
      } catch (err) {
        showToast("error", parseError(err));
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!selected.type.startsWith("image/")) {
      showToast("error", "Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, ...).");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      showToast("error", "Kích thước ảnh không được vượt quá 5MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  /* client-side validation */
  const validate = () => {
    if (!roomDetails.roomType.trim()) {
      showToast("error", t("editRoom.typeLabel") + " không được để trống.");
      return false;
    }
    const price = Number(roomDetails.roomPrice);
    if (!roomDetails.roomPrice || isNaN(price) || price <= 0) {
      showToast("error", "Giá phòng phải là số dương hợp lệ.");
      return false;
    }
    if (price < 20) {
      showToast("error", "Giá phòng tối thiểu là 20$. Vui lòng nhập lại.");
      return false;
    }
    if (!roomDetails.roomDescription.trim()) {
      showToast("error", t("editRoom.descLabel") + " không được để trống.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType", roomDetails.roomType);
      formData.append("roomPrice", roomDetails.roomPrice);
      formData.append("roomDescription", roomDetails.roomDescription);
      if (file) formData.append("photo", file);

      const result = await ApiService.updateRoom(roomId, formData);

      if (result.statusCode === 200) {
        showToast("success", t("editRoomPage.updateSuccess"), 3000);
        setTimeout(() => navigate("/admin/manage-rooms"), 3000);
      } else {
        showToast("error", `Cập nhật thất bại (mã: ${result.statusCode}).`);
      }
    } catch (err) {
      showToast("error", parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("editRoomPage.deleteConfirm"))) return;
    setLoading(true);
    try {
      const result = await ApiService.deleteRoom(roomId);
      if (result.statusCode === 200) {
        showToast("success", t("editRoomPage.deleteSuccess"), 3000);
        setTimeout(() => navigate("/admin/manage-rooms"), 3000);
      } else {
        showToast("error", `Xóa thất bại (mã: ${result.statusCode}).`);
      }
    } catch (err) {
      showToast("error", parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = React.useRef(null);

  const fieldStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e8ecef",
    fontSize: "0.9rem",
    outline: "none",
    background: "#fafbfd",
    boxSizing: "border-box",
    color: "#1a1a2e",
    fontFamily: "inherit",
    transition: "border-color 0.15s, background 0.15s",
  };
  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: "0.8rem",
    color: "#6b7280",
    letterSpacing: "0.03em",
  };

  return (
    <div className="adm-dashboard">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={dismissToast}
        />
      )}

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate("/admin/manage-rooms")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 14px",
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            background: "#fff",
            color: "#555",
            cursor: "pointer",
            fontSize: "0.83rem",
            fontWeight: 600,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#0d9488";
            e.currentTarget.style.color = "#0d9488";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#555";
          }}
        >
          ← {t("editRoom.back")}
        </button>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            {t("editRoom.title")}{" "}
            <span style={{ color: "#0d9488" }}>#{roomId}</span>
          </h2>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e8ecef",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Card header bar */}
        <div
          style={{
            background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>🛏️</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
              {roomDetails.roomType || "Đang tải..."} — Phòng #{roomId}
            </div>
            <div
              style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem" }}
            >
              {t("editRoom.subtitle")}
            </div>
          </div>
        </div>

        {/* Card body: image left + form right */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
          {/* Left: image panel */}
          <div
            style={{
              borderRight: "1px solid #f0f2f5",
              padding: 24,
              background: "#fafbfd",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Image preview */}
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e8ecef",
                aspectRatio: "4/3",
                background: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {preview || roomDetails.roomPhotoUrl ? (
                <img
                  src={preview || roomDetails.roomPhotoUrl}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#ccc" }}>
                  <div style={{ fontSize: "2rem" }}>🖼️</div>
                  <div style={{ fontSize: "0.78rem", marginTop: 6 }}>
                    Chưa có ảnh
                  </div>
                </div>
              )}
            </div>

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: "none" }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                padding: "10px 0",
                borderRadius: 9,
                border: "2px dashed #0d9488",
                background: "#f0fdfa",
                color: "#0d9488",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: "background 0.15s",
                width: "100%",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#ccfbf1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0fdfa";
              }}
            >
              {file
                ? `✓ ${file.name.length > 20 ? file.name.slice(0, 18) + "…" : file.name}`
                : `📁  ${t("editRoom.newImage")}`}
            </button>

            {file && (
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                disabled={loading}
                style={{
                  padding: "7px 0",
                  borderRadius: 8,
                  border: "1px solid #fecaca",
                  background: "#fff5f5",
                  color: "#e74c3c",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  width: "100%",
                }}
              >
                ✕ {t("editRoom.removeImage")}
              </button>
            )}

            <p
              style={{
                margin: 0,
                color: "#b0b7c3",
                fontSize: "0.75rem",
                textAlign: "center",
              }}
            >
              {t("editRoom.imageHint")}
            </p>
          </div>

          {/* Right: form */}
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Row 1: loại phòng + giá */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
              <div>
                <label style={labelStyle}>{t("editRoom.typeLabel")}</label>
                <input
                  type="text"
                  name="roomType"
                  value={roomDetails.roomType}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="VD: Deluxe, Suite, King..."
                  style={fieldStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0d9488";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e8ecef";
                    e.target.style.background = "#fafbfd";
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>{t("editRoom.priceLabel")}</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#0d9488",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    name="roomPrice"
                    min="20"
                    value={roomDetails.roomPrice}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="20"
                    style={{ ...fieldStyle, paddingLeft: 28 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0d9488";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e8ecef";
                      e.target.style.background = "#fafbfd";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("editRoom.descLabel")}</label>
              <textarea
                name="roomDescription"
                value={roomDetails.roomDescription}
                onChange={handleChange}
                disabled={loading}
                rows={7}
                placeholder="Mô tả tiện nghi, đặc điểm nổi bật của phòng..."
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.65 }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0d9488";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e8ecef";
                  e.target.style.background = "#fafbfd";
                }}
              />
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #f0f2f5" }} />

            {/* Divider before main buttons */}
            <div style={{ borderTop: "1px solid #f0f2f5" }} />

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleUpdate}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  background: loading ? "#99d6d0" : "#0d9488",
                  color: "#fff",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "#0a7c73";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = "#0d9488";
                }}
              >
                {loading
                  ? t("editRoom.updating")
                  : `✓  ${t("editRoom.updateBtn")}`}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: "12px 22px",
                  borderRadius: 10,
                  border: "1.5px solid #fca5a5",
                  background: "#fff5f5",
                  color: "#e74c3c",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#e74c3c";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "#e74c3c";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff5f5";
                  e.currentTarget.style.color = "#e74c3c";
                  e.currentTarget.style.borderColor = "#fca5a5";
                }}
              >
                🗑 {t("editRoom.deleteBtn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoomPage;
