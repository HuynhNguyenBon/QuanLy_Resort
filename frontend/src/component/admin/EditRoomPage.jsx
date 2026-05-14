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
          <div className="phong-toast__title">{isError ? "Lỗi" : "Thành công"}</div>
          <div className="phong-toast__msg">{message}</div>
        </div>
        <button className="phong-toast__close" onClick={onClose}>✕</button>
        <div className="phong-toast__bar" />
      </div>
    </>
  );
};

/* ─── EditRoomPage ─────────────────────────────────────────────────────── */
const EditRoomPage = () => {
  const { t } = useTranslation("admin");
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
    if (err.response?.data?.error)   return err.response.data.error;
    if (err.response?.status === 400) return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    if (err.response?.status === 403) return "Bạn không có quyền thực hiện thao tác này.";
    if (err.response?.status === 404) return "Không tìm thấy phòng này.";
    if (err.response?.status === 500) return "Lỗi máy chủ. Vui lòng thử lại sau.";
    if (err.message === "Network Error") return "Mất kết nối mạng. Vui lòng kiểm tra lại.";
    return err.message || "Đã xảy ra lỗi không xác định.";
  };

  /* fetch room details on mount */
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails({
          roomPhotoUrl:    response.room.roomPhotoUrl,
          roomType:        response.room.roomType,
          roomPrice:       response.room.roomPrice,
          roomDescription: response.room.roomDescription,
        });
      } catch (err) {
        showToast("error", parseError(err));
      }
    };
    fetchRoomDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) { setFile(null); setPreview(null); return; }
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
      showToast("error", "Loại phòng không được để trống.");
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
      showToast("error", "Mô tả phòng không được để trống.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType",        roomDetails.roomType);
      formData.append("roomPrice",       roomDetails.roomPrice);
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

  return (
    <div className="edit-room-container">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={dismissToast} />
      )}

      <h2>{t("editRoomPage.title")}</h2>

      <div className="edit-room-form">
        {/* Photo */}
        <div className="form-group">
          {preview ? (
            <img src={preview} alt="Room Preview" className="room-photo-preview" />
          ) : (
            roomDetails.roomPhotoUrl && (
              <img src={roomDetails.roomPhotoUrl} alt="Room" className="room-photo" />
            )
          )}
          <input
            type="file"
            name="roomPhoto"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* Room Type */}
        <div className="form-group">
          <label>{t("editRoomPage.roomType")}</label>
          <input
            type="text"
            name="roomType"
            value={roomDetails.roomType}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Room Price */}
        <div className="form-group">
          <label>{t("editRoomPage.roomPrice")}</label>
          <input
            type="number"
            name="roomPrice"
            min="20"
            placeholder="Tối thiểu 20$"
            value={roomDetails.roomPrice}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Room Description */}
        <div className="form-group">
          <label>{t("editRoomPage.roomDescription")}</label>
          <textarea
            name="roomDescription"
            value={roomDetails.roomDescription}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button className="update-button" onClick={handleUpdate} disabled={loading}>
          {loading ? "Đang xử lý..." : t("editRoomPage.updateRoom")}
        </button>

        <button className="delete-button" onClick={handleDelete} disabled={loading}>
          {t("editRoomPage.deleteRoom")}
        </button>
      </div>
    </div>
  );
};

export default EditRoomPage;
