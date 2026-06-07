import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";

const STAFF_KEY = "bbhh_staff_list";
const STAFF_META_KEY = "bbhh_staff_meta"; // metadata cho nhân viên từ API
const ROLES = [
  "receptionist",
  "manager",
  "housekeeping",
  "security",
  "kitchen",
  "maintenance",
  "spa",
  "other",
];
const ROLE_LEGACY_MAP = {
  "Quản lý": "manager",
  "Lễ tân": "receptionist",
  "Buồng phòng": "housekeeping",
  "Bảo vệ": "security",
  Bếp: "kitchen",
  "Kỹ thuật": "maintenance",
  Spa: "spa",
  "Nhân viên": "other",
  Khác: "other",
};
const resolveRoleKey = (role) =>
  ROLES.includes(role) ? role : ROLE_LEGACY_MAP[role] || null;
const EMPTY = {
  name: "",
  role: "",
  phone: "",
  email: "",
  startDate: "",
  note: "",
};

const getStaff = () => {
  try {
    return JSON.parse(localStorage.getItem(STAFF_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveStaff = (list) =>
  localStorage.setItem(STAFF_KEY, JSON.stringify(list));

// meta: { [apiId]: { role, startDate, note, phone } }
const getMeta = () => {
  try {
    return JSON.parse(localStorage.getItem(STAFF_META_KEY) || "{}");
  } catch {
    return {};
  }
};
const saveMeta = (meta) =>
  localStorage.setItem(STAFF_META_KEY, JSON.stringify(meta));

const COLORS = [
  "#6366f1",
  "#0d9488",
  "#f59e0b",
  "#e74c3c",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];
const colorFor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];

const ManageStaffPage = () => {
  const { t } = useTranslation("adminPanel");
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [accountModal, setAccountModal] = useState(null);
  const [accountErr, setAccountErr] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [modalErr, setModalErr] = useState("");

  const reloadStaff = () => {
    const local = getStaff();
    const meta = getMeta();
    ApiService.getAllUsers()
      .then((r) => {
        const apiStaff = (r.userList || [])
          .filter((u) => (u.role || "").toUpperCase() === "STAFF")
          .map((u) => {
            const m = meta[u.id] || {};
            return {
              id: `api_${u.id}`,
              _apiId: u.id,
              name: u.name,
              email: u.email,
              phone: m.phone || u.phoneNumber || "",
              role: m.role || "other",
              startDate: m.startDate || "",
              note: m.note || "",
              hasAccount: true,
              _fromApi: true,
            };
          });
        const apiEmails = new Set(apiStaff.map((s) => s.email));
        const localExtra = local.filter(
          (s) => !s.email || !apiEmails.has(s.email),
        );
        setStaff([...apiStaff, ...localExtra]);
      })
      .catch(() => setStaff(local));
  };

  useEffect(() => {
    reloadStaff();
  }, []);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 3000);
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

  const handleSave = () => {
    const { name, role, phone } = modal.data;
    if (!name.trim()) {
      setModalErr(
        t("staff.field_required", { field: t("staff.addModal.nameLabel") }),
      );
      return;
    }
    if (!role) {
      setModalErr(
        t("staff.field_required", { field: t("staff.addModal.roleLabel") }),
      );
      return;
    }
    if (!phone.trim()) {
      setModalErr(
        t("staff.field_required", { field: t("staff.addModal.phoneLabel") }),
      );
      return;
    }
    setSaving(true);
    const list = getStaff();
    if (modal.mode === "add") {
      const next = [
        ...list,
        {
          ...modal.data,
          id: Date.now(),
          name: name.trim(),
          phone: phone.trim(),
        },
      ];
      saveStaff(next);
      showMsg(t("staff.addSuccess"));
    } else if (modal.data._fromApi) {
      // Lưu metadata cho nhân viên từ API
      const meta = getMeta();
      meta[modal.data._apiId] = {
        role: modal.data.role,
        phone: phone.trim(),
        startDate: modal.data.startDate || "",
        note: modal.data.note || "",
      };
      saveMeta(meta);
      showMsg(t("staff.updateSuccess"));
    } else {
      // Nhân viên thủ công — update localStorage
      const next = list.map((s) =>
        s.id === modal.data.id ? { ...modal.data, name: name.trim() } : s,
      );
      saveStaff(next);
      showMsg(t("staff.updateSuccess"));
    }
    setSaving(false);
    closeModal();
    reloadStaff();
  };

  const handleDelete = (id) => {
    if (!window.confirm(t("staff.confirmDelete"))) return;
    // Chỉ xoá khỏi localStorage, không xoá tài khoản backend
    const next = getStaff().filter((s) => s.id !== id);
    saveStaff(next);
    showMsg(t("staff.deleteSuccess"));
    reloadStaff();
  };

  const openAccountModal = (s) => {
    setAccountErr("");
    setAccountModal({
      staffId: s.id,
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleCreateAccount = async () => {
    const { name, email, password, confirmPassword, phone } = accountModal;
    if (!email.trim()) {
      setAccountErr(t("staff.email_required"));
      return;
    }
    if (!phone.trim()) {
      setAccountErr(t("staff.phone_required"));
      return;
    }
    if (!password) {
      setAccountErr(t("staff.password_required"));
      return;
    }
    if (password.length < 6) {
      setAccountErr(t("staff.password_min"));
      return;
    }
    if (password !== confirmPassword) {
      setAccountErr(t("staff.password_match"));
      return;
    }
    setAccountSaving(true);
    try {
      await ApiService.registerUser({
        name,
        email: email.trim(),
        password,
        phoneNumber: phone.trim(),
      });
      showMsg(
        t("staff.register_success", {
          name,
          email: email.trim(),
        }),
      );
      const localList = getStaff();
      const updated = localList.map((s) =>
        s.id === accountModal.staffId
          ? { ...s, email: email.trim(), hasAccount: true }
          : s,
      );
      saveStaff(updated);
      setAccountModal(null);
      reloadStaff();
    } catch (e) {
      setAccountErr(
        e.response?.data?.message || e.message || t("staff.create_failed"),
      );
    } finally {
      setAccountSaving(false);
    }
  };

  const filtered = staff.filter(
    (s) =>
      (!search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search) ||
        s.email?.toLowerCase().includes(search.toLowerCase())) &&
      (!roleFilter || s.role === roleFilter),
  );

  const roleCounts = ROLES.reduce(
    (acc, r) => ({ ...acc, [r]: staff.filter((s) => s.role === r).length }),
    {},
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
          marginBottom: 20,
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
            <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>👨‍💼</span>{" "}
            {t("staff.title")}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
            {staff.length} {t("staff.subtitle")}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="adm-quick-btn"
          style={{ borderLeftColor: "#0d9488", flex: "none", fontWeight: 700 }}
        >
          ➕ {t("staff.addBtn")}
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

      {/* Filters */}
      <div
        className="adm-section"
        style={{ padding: "14px 20px", marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", minWidth: 240 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#aab4be",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              placeholder={t("staff.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px 9px 36px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: "0.875rem",
                outline: "none",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1.5px solid ${roleFilter ? "#0d9488" : "#e2e8f0"}`,
              fontSize: "0.875rem",
              background: roleFilter ? "#f0fdfa" : "#f8fafc",
              color: roleFilter ? "#0d9488" : "#374151",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">{t("staff.allRoles")}</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`staff.roles.${role}`)}
              </option>
            ))}
          </select>
          <span
            style={{
              marginLeft: "auto",
              background: "#f0fdf4",
              color: "#0d9488",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 20,
              border: "1px solid #bbf7d0",
            }}
          >
            {filtered.length} {t("staff.results")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="adm-section" style={{ padding: 0, overflow: "hidden" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f7f9fc",
                borderBottom: "2px solid #e8ecef",
              }}
            >
              {[
                t("staff.cols.staff"),
                t("staff.cols.role"),
                t("staff.cols.phone"),
                t("staff.cols.email"),
                t("staff.cols.startDate"),
                t("staff.cols.actions"),
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#6b7280",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 60, textAlign: "center", color: "#aaa" }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>👥</div>
                  {staff.length === 0 ? t("staff.noStaff") : t("staff.noStaff")}
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: "1px solid #f0f2f5",
                    background: idx % 2 === 0 ? "#fff" : "#fafbfd",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0fdf4")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "#fff" : "#fafbfd")
                  }
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: colorFor(s.name),
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}
                      >
                        {(s.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1a1a2e" }}>
                          {s.name}
                        </div>
                        {s.note && (
                          <div
                            style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                          >
                            {s.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        background: "#f0fdfa",
                        color: "#0d9488",
                        border: "1px solid #ccfbf1",
                      }}
                    >
                      {(() => {
                        const k = resolveRoleKey(s.role);
                        return k ? t(`staff.roles.${k}`) : s.role;
                      })()}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    {s.phone || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    {s.email || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    {s.startDate || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openEdit(s)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 7,
                          border: "1px solid #0d9488",
                          background: "transparent",
                          color: "#0d9488",
                          cursor: "pointer",
                          fontSize: "0.8rem",
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
                        ✎ {t("staff.edit")}
                      </button>
                      {s.hasAccount ? (
                        <span
                          style={{
                            padding: "5px 12px",
                            borderRadius: 7,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            border: "1px solid #bbf7d0",
                            background: "#f0fdf4",
                            color: "#15803d",
                          }}
                        >
                          ✓ {t("staff.yesAccount")}
                        </span>
                      ) : (
                        <button
                          onClick={() => openAccountModal(s)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 7,
                            border: "1px solid #6366f1",
                            background: "transparent",
                            color: "#6366f1",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#6366f1";
                            e.target.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "transparent";
                            e.target.style.color = "#6366f1";
                          }}
                        >
                          🔑 {t("staff.createAccount")}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 7,
                          border: "1px solid #fca5a5",
                          background: "#fff5f5",
                          color: "#e74c3c",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#e74c3c";
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#fff5f5";
                          e.target.style.color = "#e74c3c";
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              maxWidth: 520,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
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
                  ? `➕ ${t("staff.addModal.title")}`
                  : `✎ ${t("staff.addModal.editTitle")}`}
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
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    {t("staff.addModal.nameLabel")} *
                  </label>
                  <input
                    value={modal.data.name}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, name: e.target.value },
                      }))
                    }
                    placeholder={t("staff.addModal.namePlaceholder")}
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                    onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("staff.addModal.roleLabel")} *
                  </label>
                  <select
                    value={modal.data.role}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, role: e.target.value },
                      }))
                    }
                    style={{ ...fieldStyle, cursor: "pointer" }}
                  >
                    <option value="">{t("staff.addModal.choiceRole")}</option>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {t(`staff.roles.${role}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    {t("staff.addModal.phoneLabel")} *
                  </label>
                  <input
                    value={modal.data.phone}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, phone: e.target.value },
                      }))
                    }
                    placeholder={t("staff.addModal.phonePlaceholder")}
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                    onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("staff.addModal.emailLabel")}
                  </label>
                  <input
                    value={modal.data.email}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, email: e.target.value },
                      }))
                    }
                    placeholder={t("staff.addModal.emailPlaceholder")}
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                    onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  {t("staff.addModal.startDateLabel")}
                </label>
                <input
                  type="date"
                  value={modal.data.startDate}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      data: { ...m.data, startDate: e.target.value },
                    }))
                  }
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {t("staff.addModal.noteLabel")}
                </label>
                <input
                  value={modal.data.note}
                  onChange={(e) =>
                    setModal((m) => ({
                      ...m,
                      data: { ...m.data, note: e.target.value },
                    }))
                  }
                  placeholder={t("staff.addModal.notePlaceholder")}
                  style={fieldStyle}
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
                  }}
                >
                  ⚠️ {modalErr}
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
                    background: "#0d9488",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                  }}
                >
                  {modal.mode === "add"
                    ? `✓ ${t("staff.addModal.saveBtn")}`
                    : `✓ ${t("staff.addModal.updateBtn")}`}
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#666",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t("staff.addModal.cancelBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo tài khoản */}
      {accountModal && (
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
            if (e.target === e.currentTarget) setAccountModal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
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
                🔑 {t("staff.addModal.createStaff")}
              </span>
              <button
                onClick={() => setAccountModal(null)}
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
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontSize: "0.83rem",
                  border: "1px solid #c7d2fe",
                }}
              >
                ℹ️{" "}
                {t("staff.addModal.create_note", { name: accountModal.name })}
              </div>
              <div>
                <label style={labelStyle}>{t("staff.addModal.email2")}</label>
                <input
                  type="email"
                  value={accountModal.email}
                  onChange={(e) =>
                    setAccountModal((m) => ({ ...m, email: e.target.value }))
                  }
                  placeholder="nhanvien@bbhh.com"
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {t("staff.addModal.phoneLabel")} *
                </label>
                <input
                  type="tel"
                  value={accountModal.phone}
                  onChange={(e) =>
                    setAccountModal((m) => ({ ...m, phone: e.target.value }))
                  }
                  placeholder={t("staff.addModal.phonePlaceholder")}
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>
              <div>
                <label style={labelStyle}>{t("staff.addModal.password")}</label>
                <input
                  type="password"
                  value={accountModal.password}
                  onChange={(e) =>
                    setAccountModal((m) => ({ ...m, password: e.target.value }))
                  }
                  placeholder={t("staff.addModal.password_hint")}
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  {t("staff.addModal.confirm_password")}
                </label>
                <input
                  type="password"
                  value={accountModal.confirmPassword}
                  onChange={(e) =>
                    setAccountModal((m) => ({
                      ...m,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder={t("staff.addModal.reenter_password")}
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8ecef")}
                />
              </div>
              {accountErr && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 9,
                    background: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    fontSize: "0.85rem",
                  }}
                >
                  ⚠️ {accountErr}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleCreateAccount}
                  disabled={accountSaving}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    background: accountSaving ? "#a5b4fc" : "#6366f1",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: accountSaving ? "not-allowed" : "pointer",
                  }}
                >
                  {accountSaving ? "..." : "🔑 " + t("staff.addModal.saveBtn")}
                </button>
                <button
                  onClick={() => setAccountModal(null)}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    color: "#666",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t("staff.addModal.cancelBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaffPage;
