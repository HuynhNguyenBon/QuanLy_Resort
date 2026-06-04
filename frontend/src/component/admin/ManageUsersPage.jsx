import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
const ROLES_DISPLAY = { ADMIN: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" }, STAFF: { bg: "#ede9fe", color: "#7c3aed", border: "#c4b5fd" }, USER: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" } };

const USERS_PER_PAGE = 10;

const ManageUsersPage = () => {
  const { t } = useTranslation("adminPanel");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });

  useEffect(() => {
    ApiService.getAllUsers()
      .then(r => setUsers(r.userList || []))
      .catch(console.error);
  }, []);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 3500);
  };

  const handleSetRole = async (user, newRole) => {
    const label = newRole === "STAFF" ? "nhân viên" : "khách hàng";
    if (!window.confirm(`Đổi ${user.name} thành ${label}?`)) return;
    try {
      await ApiService.setUserRole(user.id, newRole);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      showMsg(`Đã đổi ${user.name} thành ${label}.`);
    } catch (e) {
      showMsg("Lỗi: " + (e.response?.data?.message || e.message), false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("users.confirmDelete"))) return;
    setDeletingId(id);
    try {
      await ApiService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showMsg("Đã xoá tài khoản thành công.");
    } catch (e) {
      showMsg("Xoá thất bại: " + (e.response?.data?.message || e.message), false);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(u => {
    const role = (u.role || "").toUpperCase();
    return role !== "ADMIN" && role !== "STAFF" &&
      (!search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()));
  });
  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const initials = (name) => (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#e74c3c", "#8b5cf6", "#06b6d4"];
  const colorFor = (id) => COLORS[id % COLORS.length];

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a2e" }}>👥 {t("users.title")}</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>{users.filter(u => !["ADMIN","STAFF"].includes((u.role||"").toUpperCase())).length} {t("users.subtitle")}</p>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: "0.88rem",
          background: msg.ok ? "#f0fdf4" : "#fef2f2",
          color: msg.ok ? "#15803d" : "#b91c1c",
          border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}` }}>
          {msg.text}
        </div>
      )}

      {/* Search */}
      <div className="adm-section" style={{ padding: "14px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", minWidth: 260 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: "#aab4be", fontSize: "0.9rem", pointerEvents: "none" }}>🔍</span>
            <input placeholder={t("users.searchPlaceholder")}
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 10,
                border: "1.5px solid #e2e8f0", fontSize: "0.875rem", outline: "none",
                background: "#f8fafc", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#0d9488"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <span style={{ marginLeft: "auto", background: "#f0fdf4", color: "#0d9488",
            fontSize: "0.8rem", fontWeight: 600, padding: "6px 12px", borderRadius: 20,
            border: "1px solid #bbf7d0" }}>
            {filtered.length} {t("users.results")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="adm-section" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "#f7f9fc", borderBottom: "2px solid #e8ecef" }}>
              {[t("users.cols.customer"), t("users.cols.email"), t("users.cols.role"), t("users.cols.bookings"), ...(ApiService.isAdmin() ? [t("users.cols.actions")] : [])].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700,
                  color: "#555", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
                {t("users.noUsers")}
              </td></tr>
            ) : paginated.map((user, idx) => (
              <tr key={user.id}
                style={{ borderBottom: "1px solid #f0f0f0",
                  background: idx % 2 === 0 ? "#fff" : "#fafbfd" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfd"}>

                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%",
                      background: colorFor(user.id || idx), color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "0.82rem", flexShrink: 0 }}>
                      {initials(user.name)}
                    </div>
                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{user.name || "—"}</span>
                  </div>
                </td>

                <td style={{ padding: "12px 16px", color: "#555" }}>{user.email}</td>

                <td style={{ padding: "12px 16px" }}>
                  {(() => {
                    const rd = ROLES_DISPLAY[user.role] || ROLES_DISPLAY.USER;
                    const roleKey = user.role === "ADMIN" ? "roleAdmin" : user.role === "STAFF" ? "roleStaff" : "roleUser";
                    return (
                      <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
                        background: rd.bg, color: rd.color, border: `1px solid ${rd.border}` }}>
                        {t(`users.${roleKey}`)}
                      </span>
                    );
                  })()}
                </td>

                <td style={{ padding: "12px 16px", color: "#0d9488", fontWeight: 700 }}>
                  {user.bookings?.length ?? 0}
                </td>

                {ApiService.isAdmin() ? (
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                    {user.role !== "ADMIN" && (
                      <>
                        {user.role === "STAFF" ? (
                          <button onClick={() => handleSetRole(user, "USER")}
                            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #c4b5fd",
                              background: "#ede9fe", color: "#7c3aed", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.color = "#7c3aed"; }}>
                            👤 {t("users.demoteUser")}
                          </button>
                        ) : (
                          <button onClick={() => handleSetRole(user, "STAFF")}
                            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #c4b5fd",
                              background: "transparent", color: "#7c3aed", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#7c3aed"; }}>
                            👨‍💼 {t("users.promoteStaff")}
                          </button>
                        )}
                        <button onClick={() => handleDelete(user.id)} disabled={deletingId === user.id}
                          style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #fca5a5",
                            background: "#fff5f5", color: "#e74c3c", cursor: "pointer",
                            fontSize: "0.82rem", fontWeight: 600, transition: "all 0.15s",
                            opacity: deletingId === user.id ? 0.6 : 1 }}
                          onMouseEnter={e => { if (deletingId !== user.id) { e.target.style.background = "#e74c3c"; e.target.style.color = "#fff"; }}}
                          onMouseLeave={e => { e.target.style.background = "#fff5f5"; e.target.style.color = "#e74c3c"; }}>
                          {deletingId === user.id ? "..." : `🗑 ${t("users.delete")}`}
                        </button>
                      </>
                    )}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 0" }}>
            <Pagination roomsPerPage={USERS_PER_PAGE} totalRooms={filtered.length}
              currentPage={currentPage} paginate={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsersPage;
