import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { getRoomTranslation } from "../../data/roomTranslations";

/* ─── Toast Component (dùng chung style với EditRoomPage) ──────────────── */
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === "error";
  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity:0; transform:translateX(60px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes toastBarError   { from{width:100%} to{width:0%} }
        @keyframes toastBarSuccess { from{width:100%} to{width:0%} }
        .phong-toast {
          position:fixed; top:24px; right:24px; z-index:9999;
          min-width:300px; max-width:440px;
          display:flex; align-items:flex-start; gap:12px;
          padding:16px 18px; border-radius:12px;
          box-shadow:0 8px 28px rgba(0,0,0,0.14);
          font-size:14px; line-height:1.5; overflow:hidden;
          animation:toastSlideIn 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards;
        }
        .phong-toast.error   { background:#fff1f0; border:1px solid #ffa39e; color:#a8071a; }
        .phong-toast.success { background:#f6ffed; border:1px solid #95de64; color:#237804; }
        .phong-toast__icon  { font-size:20px; flex-shrink:0; margin-top:1px; }
        .phong-toast__body  { flex:1; }
        .phong-toast__title { font-weight:600; font-size:14px; margin-bottom:2px; }
        .phong-toast__msg   { font-size:13px; opacity:0.85; }
        .phong-toast__close { background:none !important;border:none !important;cursor:pointer;font-size:16px;opacity:0.5;padding:4px 6px;color:inherit;flex-shrink:0;border-radius:4px;transition:opacity 0.15s; }
        .phong-toast__close:hover { opacity:1 !important; background:rgba(0,0,0,0.08) !important; }
        .phong-toast__bar   { position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 12px 12px; }
        .phong-toast.error   .phong-toast__bar { background:#ff4d4f; animation:toastBarError   5s linear forwards; }
        .phong-toast.success .phong-toast__bar { background:#52c41a; animation:toastBarSuccess 3s linear forwards; }
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

/* ─── map backend English messages → Vietnamese ────────────────────────── */
const BACKEND_MSG_MAP = {
  "please provide values for all fields":
    "Vui lòng điền đầy đủ thông tin phòng (ảnh, loại phòng, giá phòng).",
  photo: "Vui lòng tải lên ảnh phòng.",
  roomtype: "Vui lòng chọn hoặc nhập loại phòng.",
  roomprice: "Vui lòng nhập giá phòng hợp lệ.",
  "room type already exists": "Loại phòng này đã tồn tại trong hệ thống.",
  unauthorized: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
  forbidden: "Bạn không có quyền thực hiện thao tác này.",
  "internal server error": "Lỗi máy chủ. Vui lòng thử lại sau.",
};

const translateBackendMsg = (msg) => {
  if (!msg) return null;
  const lower = msg.toLowerCase();
  for (const [key, vi] of Object.entries(BACKEND_MSG_MAP)) {
    if (lower.includes(key)) return vi;
  }
  return msg; // fallback: hiển thị nguyên văn nếu không map được
};

const parseError = (err) => {
  const raw = err.response?.data?.message || err.response?.data?.error || null;
  if (raw) return translateBackendMsg(raw);
  if (err.response?.status === 400)
    return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
  if (err.response?.status === 403)
    return "Bạn không có quyền thực hiện thao tác này.";
  if (err.response?.status === 500) return "Lỗi máy chủ. Vui lòng thử lại sau.";
  if (err.message === "Network Error")
    return "Mất kết nối mạng. Vui lòng kiểm tra lại.";
  return err.message || "Đã xảy ra lỗi không xác định.";
};

/* ─── Custom room-type dropdown ────────────────────────────────────────── */
const RoomTypeDropdown = ({
  roomTypes,
  value,
  isNew,
  onChange,
  disabled,
  t,
  lang,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = isNew
    ? "✏️ " + t("addRoom.newType")
    : value
      ? getRoomTranslation(value, lang)?.roomType || value
      : t("addRoom.allTypes");
  const hasValue = !isNew && !!value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 8,
          border: `1.5px solid ${open ? "#0d9488" : "#e8ecef"}`,
          background: open ? "#fff" : "#fafbfd",
          color: hasValue || isNew ? "#1a1a2e" : "#9ca3af",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "0.9rem",
          outline: "none",
          textAlign: "left",
          transition: "all 0.15s",
          fontFamily: "inherit",
        }}
      >
        <span>{displayLabel}</span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#9ca3af",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 999,
            overflow: "hidden",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {/* Placeholder */}
          <div
            style={{
              padding: "10px 16px",
              fontSize: "0.82rem",
              color: "#b0b7c3",
              borderBottom: "1px solid #f0f2f5",
              cursor: "default",
            }}
          >
            {t("addRoom.allTypes")}
          </div>

          {/* Existing types */}
          {roomTypes.map((type) => {
            const active = !isNew && value === type;
            return (
              <div
                key={type}
                onClick={() => {
                  onChange(type, false);
                  setOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  color: active ? "#fff" : "#1a1a2e",
                  background: active ? "#0d9488" : "transparent",
                  fontWeight: active ? 600 : 400,
                  transition: "background 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#f0fdfa";
                    e.currentTarget.style.color = "#0d9488";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#1a1a2e";
                  }
                }}
              >
                {getRoomTranslation(type, lang)?.roomType || type}
              </div>
            );
          })}

          {/* New type option */}
          <div
            onClick={() => {
              onChange("", true);
              setOpen(false);
            }}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: "0.88rem",
              color: isNew ? "#fff" : "#f59e0b",
              background: isNew ? "#f59e0b" : "transparent",
              fontWeight: 600,
              borderTop: "1px solid #f0f2f5",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
              if (!isNew) {
                e.currentTarget.style.background = "#fffbeb";
                e.currentTarget.style.color = "#d97706";
              }
            }}
            onMouseLeave={(e) => {
              if (!isNew) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#f59e0b";
              }
            }}
          >
            {"✏️ "}
            {t("addRoom.newType")}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── AddRoomPage ──────────────────────────────────────────────────────── */
const AddRoomPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const navigate = useNavigate();
  const lang = i18n.language.split("-")[0];

  const [roomDetails, setRoomDetails] = useState({
    roomPhotoUrl: "",
    roomType: "",
    roomPrice: "",
    roomDescription: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [newRoomType, setNewRoomType] = useState(false);
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

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (err) {
        console.error("Error fetching room types:", err.message);
      }
    };
    fetchRoomTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomTypeChange = (type, isNew) => {
    setNewRoomType(isNew);
    setRoomDetails((prev) => ({ ...prev, roomType: isNew ? "" : type }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!selected.type.startsWith("image/")) {
      showToast("error", t("addRoom.imageInvalid"));
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      showToast("error", t("addRoom.imageSize"));
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  /* client-side validation — chặn trước khi gọi API */
  const validate = () => {
    if (!file) {
      showToast("error", t("addRoom.imageRequired"));
      return false;
    }
    if (!roomDetails.roomType.trim()) {
      showToast("error", t("addRoom.typeRequired2"));
      return false;
    }
    const price = Number(roomDetails.roomPrice);
    if (!roomDetails.roomPrice || isNaN(price) || price <= 0) {
      showToast("error", t("addRoom.priceInvalid"));
      return false;
    }
    if (price < 20) {
      showToast("error", t("addRoom.priceMin"));
      return false;
    }
    if (!roomDetails.roomDescription.trim()) {
      showToast("error", t("addRoom.descRequired"));
      return false;
    }
    return true;
  };

  const addRoom = async () => {
    if (!validate()) return;
    if (!window.confirm(t("addRoom.confirmAdd"))) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType", roomDetails.roomType);
      formData.append("roomPrice", roomDetails.roomPrice);
      formData.append("roomDescription", roomDetails.roomDescription);
      if (file) formData.append("photo", file);

      const result = await ApiService.addRoom(formData);

      if (result.statusCode === 200) {
        showToast("success", t("addRoom.roomAdded"), 3000);
        setTimeout(() => navigate("/admin/manage-rooms"), 3000);
      } else {
        showToast(
          "error",
          t("addRoom.add_failed", { code: result.statusCode }),
        );
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
          ← {t("addRoom.back", "Quay lại")}
        </button>
        <h2
          style={{
            margin: 0,
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "#1a1a2e",
          }}
        >
          {t("addRoom.title")} <span style={{ color: "#0d9488" }}></span>
        </h2>
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
        {/* Card header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>➕</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
              {t("addRoom.title")}
            </div>
            <div
              style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem" }}
            >
              {t("addRoom.subtitle")}
            </div>
          </div>
        </div>

        {/* Card body */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
          {/* Left: image upload */}
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
            <span style={labelStyle}>
              {t("addRoom.imageLabel")}{" "}
              <span style={{ color: "#e74c3c" }}>*</span>
            </span>

            {/* Preview / drop zone */}
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              style={{
                borderRadius: 12,
                border: `2px dashed ${preview ? "#0d9488" : "#d1d5db"}`,
                background: preview ? "transparent" : "#f0f2f5",
                aspectRatio: "4/3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer",
                overflow: "hidden",
                transition: "border-color 0.15s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!preview) e.currentTarget.style.borderColor = "#0d9488";
              }}
              onMouseLeave={(e) => {
                if (!preview) e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      Đổi ảnh
                    </span>
                  </div>
                </>
              ) : (
                <div
                  style={{ textAlign: "center", color: "#9ca3af", padding: 16 }}
                >
                  <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {t("addRoom.clickToUpload")}
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                    {t("addRoom.imageHint")}
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: "none" }}
            />

            {preview && (
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
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
            {/* Loại phòng */}
            <div>
              <label style={labelStyle}>{t("addRoom.typeRequired")}</label>
              <RoomTypeDropdown
                roomTypes={roomTypes}
                value={roomDetails.roomType}
                isNew={newRoomType}
                onChange={handleRoomTypeChange}
                disabled={loading}
                t={t}
                lang={lang}
              />

              {newRoomType && (
                <input
                  type="text"
                  name="roomType"
                  placeholder={t("addRoom.namePlaceholder")}
                  value={roomDetails.roomType}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ ...fieldStyle, marginTop: 10 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0d9488";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e8ecef";
                    e.target.style.background = "#fafbfd";
                  }}
                  autoFocus
                />
              )}
            </div>

            {/* Giá */}
            <div>
              <label style={labelStyle}>
                {t("addRoom.priceLabel")}{" "}
                <span style={{ color: "#e74c3c" }}>*</span>
              </label>
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
                  placeholder={t("addRoom.pricePlaceholder")}
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

            {/* Mô tả */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                {t("addRoom.descLabel")}{" "}
                <span style={{ color: "#e74c3c" }}>*</span>
              </label>
              <textarea
                name="roomDescription"
                rows={7}
                value={roomDetails.roomDescription}
                onChange={handleChange}
                disabled={loading}
                placeholder={t("addRoom.descPlaceholder")}
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

            <div style={{ borderTop: "1px solid #f0f2f5" }} />

            {/* Submit */}
            <button
              onClick={addRoom}
              disabled={loading}
              style={{
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background: loading ? "#99d6d0" : "#0d9488",
                color: "#fff",
                fontSize: "0.95rem",
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
                ? t("addRoom.submitting")
                : `➕  ${t("addRoom.submitBtn")}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoomPage;
