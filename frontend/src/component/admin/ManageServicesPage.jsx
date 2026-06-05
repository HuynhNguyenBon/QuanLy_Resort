import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import {
  STATIC_SERVICES,
  EMOJI_MAP,
  mergeServices,
  getServiceTranslation,
} from "../../data/staticServices";

const EXCHANGE_RATES = { vi: 25000, ja: 155, en: 1 };
const formatPrice = (amountUSD, lang) => {
  const code = (lang || "en").split("-")[0];
  if (code === "vi")
    return `${Math.round(amountUSD * EXCHANGE_RATES.vi).toLocaleString("vi-VN")} VNĐ`;
  if (code === "ja")
    return `¥${Math.round(amountUSD * EXCHANGE_RATES.ja).toLocaleString("ja-JP")}`;
  return `$${new Intl.NumberFormat().format(Math.round(amountUSD))}`;
};

const EMPTY = { name: "", description: "", price: "", icon: "" };
const HIDDEN_KEY = "bbhh_hidden_static_services";

const getHidden = () => {
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
  } catch {
    return [];
  }
};
const addHidden = (name) => {
  const h = getHidden();
  if (!h.includes(name)) {
    h.push(name);
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(h));
  }
};

const ManageServicesPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const lang = i18n.language.split("-")[0];
  const getSvcName = (s) => getServiceTranslation(s.name, lang)?.name || s.name;
  const getSvcDesc = (s) =>
    getServiceTranslation(s.name, lang)?.description || s.description;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [modalErr, setModalErr] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    setLoading(true);
    const hidden = getHidden();
    ApiService.getAllServices()
      .then((r) => {
        const apiList = r.serviceList || r || [];
        const apiPaid = apiList
          .filter((s) => s.price != null && Number(s.price) > 0)
          .map((s) => ({ ...s, _isApi: true }));
        const apiNames = new Set(apiList.map((s) => s.name));
        const staticExtra = STATIC_SERVICES.filter(
          (s) => !apiNames.has(s.name) && !hidden.includes(s.name),
        ).map((s) => ({ ...s, _isApi: false }));
        setServices([...apiPaid, ...staticExtra]);
      })
      .catch(() => {
        const hidden = getHidden();
        setServices(
          STATIC_SERVICES.filter((s) => !hidden.includes(s.name)).map((s) => ({
            ...s,
            _isApi: false,
          })),
        );
      })
      .finally(() => setLoading(false));
  };

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 3500);
  };

  const openAdd = () => {
    setModalErr("");
    setModal({ mode: "add", data: { ...EMPTY } });
  };
  const openEdit = (s) => {
    setModalErr("");
    setModal({ mode: "edit", data: { ...s } });
  };
  const closeModal = () => {
    setModal(null);
    setModalErr("");
  };

  const handleSave = async () => {
    const { name, description, price } = modal.data;
    if (!name.trim()) {
      setModalErr(t("services.nameRequired"));
      return;
    }
    if (!description.trim()) {
      setModalErr(t("services.descRequired"));
      return;
    }
    setModalErr("");
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: price !== "" && price != null ? Number(price) : 0,
    };
    try {
      const isBuiltIn = modal.mode === "edit" && !modal.data._isApi;
      if (modal.mode === "add" || isBuiltIn) {
        await ApiService.addService(payload);
        if (isBuiltIn) addHidden(modal.data.name);
        showMsg(
          isBuiltIn ? t("services.saveSuccess") : t("services.addSuccess"),
        );
      } else {
        await ApiService.updateService(modal.data.id, payload);
        showMsg(t("services.updateSuccess"));
      }
      closeModal();
      fetchServices();
    } catch (e) {
      const detail =
        e.response?.data?.message ||
        e.response?.data?.error ||
        (typeof e.response?.data === "string" ? e.response.data : null) ||
        e.message ||
        t("services.errUnknown");
      setModalErr(
        t("services.errPrefix") +
          " " +
          (e.response?.status || "") +
          ": " +
          detail,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(t("services.confirmDelete"))) return;
    setDeletingId(s.id);
    try {
      if (!s._isApi) {
        addHidden(s.name);
        setServices((prev) => prev.filter((x) => x.id !== s.id));
        showMsg(t("services.hideSuccess"));
      } else {
        await ApiService.deleteService(s.id);
        setServices((prev) => prev.filter((x) => x.id !== s.id));
        showMsg(t("services.deleteSuccess"));
      }
    } catch (e) {
      showMsg(
        t("services.deleteFail") +
          ": " +
          (e.response?.data?.message || e.message),
        false,
      );
    } finally {
      setDeletingId(null);
    }
  };

  const ServiceCard = ({ s }) => (
    <div className="adm-section" style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: Number(s.price) > 0 ? "#f0fdfa" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0,
            }}
          >
            {s.icon || EMOJI_MAP[s.name] || "🛎️"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: "#1a1a2e",
                  fontSize: "0.93rem",
                }}
              >
                {getSvcName(s)}
              </span>
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: Number(s.price) > 0 ? "#0d9488" : "#94a3b8",
              }}
            >
              {Number(s.price) > 0
                ? formatPrice(Number(s.price), lang)
                : t("services.free")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => openEdit(s)}
            style={{
              padding: "5px 11px",
              borderRadius: 7,
              border: "1px solid #0d9488",
              background: "transparent",
              color: "#0d9488",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#0d9488";
              e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#0d9488";
            }}
          >
            ✎
          </button>
          <button
            onClick={() => handleDelete(s)}
            disabled={deletingId === s.id}
            style={{
              padding: "5px 11px",
              borderRadius: 7,
              border: "1px solid #fca5a5",
              background: "#fff5f5",
              color: "#e74c3c",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              opacity: deletingId === s.id ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (deletingId !== s.id) {
                e.target.style.background = "#e74c3c";
                e.target.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#fff5f5";
              e.target.style.color = "#e74c3c";
            }}
          >
            {deletingId === s.id ? "..." : "🗑"}
          </button>
        </div>
      </div>
      {getSvcDesc(s) && (
        <p
          style={{
            margin: "12px 0 0",
            color: "#666",
            fontSize: "0.83rem",
            lineHeight: 1.5,
          }}
        >
          {getSvcDesc(s).length > 100
            ? getSvcDesc(s).slice(0, 100) + "..."
            : getSvcDesc(s)}
        </p>
      )}
    </div>
  );

  const fieldStyle = {
    width: "100%",
    padding: "9px 13px",
    borderRadius: 8,
    border: "1.5px solid #e8ecef",
    fontSize: "0.88rem",
    outline: "none",
    background: "#fafbfd",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };
  const labelStyle = {
    display: "block",
    marginBottom: 5,
    fontWeight: 600,
    fontSize: "0.79rem",
    color: "#6b7280",
  };

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>🛎️</span>{" "}
            {t("services.title")}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
            {services.length} {t("services.subtitle")}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="adm-quick-btn"
          style={{ borderLeftColor: "#0d9488", flex: "none", fontWeight: 700 }}
        >
          ➕ {t("services.addBtn")}
        </button>
      </div>

      {msg.text && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: "0.88rem",
            background: msg.ok ? "#f0fdf4" : "#fef2f2",
            color: msg.ok ? "#15803d" : "#b91c1c",
            border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Grid of services */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          {t("revenue.loading")}
        </div>
      ) : services.length === 0 ? (
        <div
          className="adm-section"
          style={{ padding: 60, textAlign: "center", color: "#aaa" }}
        >
          {t("services.noServices")}
        </div>
      ) : (
        <>
          {/* Dịch vụ có phí — hiển thị với khách hàng */}
          {services.filter((s) => Number(s.price) > 0).length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: "#1a1a2e",
                  }}
                >
                  {t("services.paidSection")}
                </span>
                <span
                  style={{
                    background: "#f0fdf4",
                    color: "#15803d",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: "1px solid #bbf7d0",
                  }}
                >
                  {t("services.paidBadge")}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {services
                  .filter((s) => Number(s.price) > 0)
                  .map((s) => (
                    <ServiceCard key={s.id} s={s} />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                background: "linear-gradient(135deg, #0d9488, #0f766e)",
                padding: "18px 24px",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}
              >
                {modal.mode === "add"
                  ? `➕ ${t("services.addModal.addTitle")}`
                  : `✎ ${t("services.addModal.editTitle")}`}
              </span>
              <button
                onClick={closeModal}
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>
                  {t("services.addModal.nameLabel")} *
                </label>
                <input
                  value={modal.data.name}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      data: { ...m.data, name: e.target.value },
                    }))
                  }
                  placeholder="VD: Spa & Massage, Airport Transfer..."
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    {t("services.addModal.iconLabel")}
                  </label>
                  <input
                    value={modal.data.icon || ""}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, icon: e.target.value },
                      }))
                    }
                    placeholder="🛎️"
                    style={{ ...fieldStyle, fontSize: "1.2rem" }}
                    onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                    onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("services.addModal.priceLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modal.data.price || ""}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, price: e.target.value },
                      }))
                    }
                    placeholder="0"
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                    onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  {t("services.addModal.descLabel")} *
                </label>
                <textarea
                  rows={4}
                  value={modal.data.description}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      data: { ...m.data, description: e.target.value },
                    }))
                  }
                  placeholder={t("services.addModal.descLabel") + "..."}
                  style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>

              {modalErr && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 9,
                    background: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <span style={{ flexShrink: 0 }}>⚠️</span>
                  <span>{modalErr}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    background: saving ? "#99d6d0" : "#0d9488",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) e.currentTarget.style.background = "#0a7c73";
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) e.currentTarget.style.background = "#0d9488";
                  }}
                >
                  {saving
                    ? t("services.addModal.saving")
                    : `✓ ${modal.mode === "add" ? t("services.addModal.saveBtn") : t("services.addModal.updateBtn")}`}
                </button>
                <button
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#666",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {t("services.addModal.cancelBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServicesPage;
