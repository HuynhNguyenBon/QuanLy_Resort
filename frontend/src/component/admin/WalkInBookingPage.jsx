import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ApiService from "../../service/ApiService";
import { getRoomTranslation } from "../../data/roomTranslations";

const today = () => new Date().toISOString().split("T")[0];
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };

const WalkInBookingPage = () => {
  const { t, i18n } = useTranslation("adminPanel");
  const lang = i18n.language.split("-")[0];
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=dates, 2=room, 3=guest, 4=confirm
  const [rooms, setRooms]         = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting]= useState(false);
  const [msg, setMsg]             = useState({ text: "", ok: true });

  const [checkIn,    setCheckIn]    = useState(addDays(1));
  const [checkOut,   setCheckOut]   = useState(addDays(2));
  const [roomType,   setRoomType]   = useState("");
  const [adults,     setAdults]     = useState(1);
  const [children,   setChildren]   = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [guestName,  setGuestName]  = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [payMethod,  setPayMethod]  = useState("cash"); // cash | vnpay

  const nights = Math.max(1, Math.round((new Date(checkOut)-new Date(checkIn))/86400000));

  const showMsg = (text, ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg({text:"",ok:true}),4000); };

  // Step 1 → 2: search available rooms
  const handleSearch = async () => {
    if (!checkIn || !checkOut || new Date(checkIn)>=new Date(checkOut)) {
      showMsg(t("walkIn.errorDate"), false); return;
    }
    setLoading(true);
    try {
      const types = roomType ? [roomType] : (await ApiService.getRoomTypes());
      const results = await Promise.all(
        types.map(t => ApiService.getAvailableRoomsByDateAndType(checkIn, checkOut, t)
          .then(r => r.roomList || []).catch(()=>[]))
      );
      const available = results.flat();
      setRooms(available);
      if (available.length === 0) { showMsg(t("walkIn.errorNoRoom"), false); }
      else { setStep(2); }
    } catch(e) {
      showMsg("Lỗi tìm phòng: " + (e.message||""), false);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    ApiService.getRoomTypes().then(setRoomTypes).catch(()=>{});
  }, []);

  // Step 3: guest info
  const handleSelectRoom = (room) => { setSelectedRoom(room); setStep(3); };

  // Step 4: confirm
  const handleGuestNext = () => {
    if (!guestName.trim())  { showMsg(t("walkIn.errorName"), false); return; }
    if (!guestEmail.trim()) { showMsg(t("walkIn.errorEmail"), false); return; }
    setStep(4);
  };

  // Submit booking
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Tìm user theo email trong hệ thống
      const usersRes = await ApiService.getAllUsers();
      const users = usersRes.userList || [];
      const found = users.find(u => u.email?.toLowerCase() === guestEmail.trim().toLowerCase());

      if (!found) {
        showMsg(t("walkIn.errorNotFound"), false);
        setSubmitting(false); return;
      }

      const bookingData = {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numOfAdults: adults,
        numOfChildren: children,
      };

      const res = await ApiService.bookRoom(selectedRoom.id, found.id, bookingData);
      if (res.statusCode === 200) {
        showMsg(`${t("walkIn.successMsg")} ${res.bookingConfirmationCode}`);
        setTimeout(() => navigate("/admin/manage-bookings"), 3000);
      } else {
        showMsg(`Đặt phòng thất bại (mã: ${res.statusCode}).`, false);
      }
    } catch(e) {
      showMsg("Lỗi: " + (e.response?.data?.message || e.message), false);
    } finally { setSubmitting(false); }
  };

  const STEP_LABELS = [t("walkIn.step1"), t("walkIn.step2"), t("walkIn.step3"), t("walkIn.step4")];

  const fieldStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e8ecef",
    fontSize: "0.9rem", outline: "none", background: "#fafbfd", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.15s",
  };
  const labelStyle = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: "0.8rem", color: "#6b7280" };

  return (
    <div className="adm-dashboard">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a2e",
          display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.3rem" }}>🏷️</span> {t("walkIn.title")}
        </h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.88rem" }}>
          {t("walkIn.subtitle")}
        </p>
      </div>

      {msg.text && (
        <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: "0.88rem",
          background: msg.ok ? "#f0fdf4" : "#fef2f2",
          color: msg.ok ? "#15803d" : "#b91c1c",
          border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}` }}>
          {msg.ok ? "✓" : "⚠️"} {msg.text}
        </div>
      )}

      {/* Step indicator */}
      <div className="adm-section" style={{ padding: "16px 24px", marginBottom: 0, borderRadius: "12px 12px 0 0", borderBottom: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem",
                  background: step > i+1 ? "#0d9488" : step === i+1 ? "#0d9488" : "#f1f5f9",
                  color: step >= i+1 ? "#fff" : "#94a3b8",
                  border: step === i+1 ? "3px solid #ccfbf1" : "none",
                  cursor: step > i+1 ? "pointer" : "default",
                  transition: "all 0.2s" }}
                  onClick={() => { if (step > i+1) setStep(i+1); }}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: step===i+1?700:400,
                  color: step===i+1?"#0d9488":"#94a3b8", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < STEP_LABELS.length-1 && (
                <div style={{ flex: 1, height: 2, background: step > i+1 ? "#0d9488" : "#f1f5f9",
                  margin: "0 8px", marginBottom: 22, transition: "background 0.3s" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="adm-section" style={{ padding: 28, borderRadius: "0 0 12px 12px", minHeight: 360 }}>

        {/* ── STEP 1: Dates ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
            <h3 style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>📅 {t("walkIn.step1Title")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>{t("walkIn.checkin")} *</label>
                <input type="date" value={checkIn} min={today()}
                  onChange={e => setCheckIn(e.target.value)} style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor="#0d9488"} onBlur={e=>e.target.style.borderColor="#e8ecef"} />
              </div>
              <div>
                <label style={labelStyle}>{t("walkIn.checkout")} *</label>
                <input type="date" value={checkOut} min={checkIn || today()}
                  onChange={e => setCheckOut(e.target.value)} style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor="#0d9488"} onBlur={e=>e.target.style.borderColor="#e8ecef"} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>{t("walkIn.roomTypeOpt")}</label>
                <select value={roomType} onChange={e=>setRoomType(e.target.value)} style={fieldStyle}>
                  <option value="">{t("walkIn.allTypes")}</option>
                  {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t("walkIn.adults")}</label>
                <input type="number" min="1" max="8" value={adults} onChange={e=>setAdults(+e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t("walkIn.children")}</label>
                <input type="number" min="0" max="4" value={children} onChange={e=>setChildren(+e.target.value)} style={fieldStyle} />
              </div>
            </div>
            {checkIn && checkOut && new Date(checkIn)<new Date(checkOut) && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdfa",
                color: "#0d9488", fontSize: "0.85rem", fontWeight: 600 }}>
                🌙 {nights} {t("walkIn.nightsSummary")} · {adults} {t("walkIn.adults")}{children>0?`, ${children} ${t("walkIn.children")}`:""}
              </div>
            )}
            <button onClick={handleSearch} disabled={loading}
              style={{ padding: "13px", borderRadius: 10, border: "none",
                background: loading?"#99d6d0":"#0d9488", color: "#fff",
                fontWeight: 700, fontSize: "0.95rem", cursor: loading?"not-allowed":"pointer" }}>
              {loading ? t("walkIn.searching") : `🔍 ${t("walkIn.searchBtn")}`}
            </button>
          </div>
        )}

        {/* ── STEP 2: Select room ── */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>
                🛏️ {t("walkIn.step2Title")} ({rooms.length} {t("walkIn.available")})
              </h3>
              <button onClick={() => setStep(1)}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                  background: "#fff", color: "#555", cursor: "pointer", fontSize: "0.83rem" }}>
                {t("walkIn.back")}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {rooms.map(room => (
                <div key={room.id} onClick={() => handleSelectRoom(room)}
                  style={{ padding: 16, borderRadius: 12, border: "1.5px solid #e8ecef",
                    cursor: "pointer", transition: "all 0.15s", background: "#fff" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#0d9488"; e.currentTarget.style.background="#f0fdfa"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#e8ecef"; e.currentTarget.style.background="#fff"; }}>
                  {room.roomPhotoUrl && (
                    <img src={room.roomPhotoUrl} alt={room.roomType}
                      style={{ width:"100%", height:120, objectFit:"cover", borderRadius:8, marginBottom:10 }} />
                  )}
                  <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: "0.95rem" }}>
                    #{room.id} — {getRoomTranslation(room.roomType, lang)?.roomType || room.roomType}
                  </div>
                  <div style={{ color: "#0d9488", fontWeight: 700, fontSize: "1.05rem", marginTop: 4 }}>
                    ${room.roomPrice}<span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.8rem" }}>/{t("walkIn.nightsSummary")}</span>
                    <span style={{ marginLeft: 8, color: "#0d9488", fontSize: "0.85rem" }}>
                      = ${room.roomPrice * nights} {t("walkIn.totalNight")}
                    </span>
                  </div>
                  {(getRoomTranslation(room.roomType, lang)?.roomDescription || room.roomDescription) && (
                    <p style={{ margin: "8px 0 0", color: "#666", fontSize: "0.8rem", lineHeight: 1.5 }}>
                      {(() => { const d = getRoomTranslation(room.roomType, lang)?.roomDescription || room.roomDescription; return d.slice(0,80)+(d.length>80?"...":""); })()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Guest info ── */}
        {step === 3 && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>👤 {t("walkIn.step3Title")}</h3>
              <button onClick={() => setStep(2)}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                  background: "#fff", color: "#555", cursor: "pointer", fontSize: "0.83rem" }}>
                {t("walkIn.back")}
              </button>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#f0fdfa",
              border: "1px solid #ccfbf1", marginBottom: 20, fontSize: "0.85rem", color: "#0d9488" }}>
              ℹ️ {t("walkIn.emailNote")} <strong>/register</strong>.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>{t("walkIn.nameLabel")} *</label>
                <input value={guestName} onChange={e=>setGuestName(e.target.value)}
                  placeholder="Nguyen Van A" style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor="#0d9488"} onBlur={e=>e.target.style.borderColor="#e8ecef"} />
              </div>
              <div>
                <label style={labelStyle}>{t("walkIn.emailLabel")} *</label>
                <input type="email" value={guestEmail} onChange={e=>setGuestEmail(e.target.value)}
                  placeholder="guest@gmail.com" style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor="#0d9488"} onBlur={e=>e.target.style.borderColor="#e8ecef"} />
              </div>
              <div>
                <label style={labelStyle}>{t("walkIn.phoneLabel")}</label>
                <input value={guestPhone} onChange={e=>setGuestPhone(e.target.value)}
                  placeholder="0901234567" style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor="#0d9488"} onBlur={e=>e.target.style.borderColor="#e8ecef"} />
              </div>
              <div>
                <label style={labelStyle}>{t("walkIn.payMethod")}</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{key:"cash",label:t("walkIn.cash")},{key:"vnpay",label:t("walkIn.vnpay")}].map(p => (
                    <button key={p.key} onClick={()=>setPayMethod(p.key)}
                      style={{ flex:1, padding:"10px", borderRadius:9,
                        border:`2px solid ${payMethod===p.key?"#0d9488":"#e8ecef"}`,
                        background: payMethod===p.key?"#f0fdfa":"#fff",
                        color: payMethod===p.key?"#0d9488":"#555",
                        fontWeight: payMethod===p.key?700:400, cursor:"pointer", fontSize:"0.9rem" }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleGuestNext}
                style={{ padding:"12px", borderRadius:10, border:"none",
                  background:"#0d9488", color:"#fff", fontWeight:700, fontSize:"0.95rem", cursor:"pointer" }}>
                {t("walkIn.nextBtn")}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Confirm ── */}
        {step === 4 && selectedRoom && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: "#1a1a2e" }}>✅ {t("walkIn.step4Title")}</h3>
              <button onClick={() => setStep(3)}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                  background: "#fff", color: "#555", cursor: "pointer", fontSize: "0.83rem" }}>
                {t("walkIn.back")}
              </button>
            </div>
            {[
              { icon:"🛏️", label:t("walkIn.fieldRoom"),   value:`#${selectedRoom.id} — ${selectedRoom.roomType}` },
              { icon:"📅", label:t("walkIn.checkin"),     value:checkIn },
              { icon:"📅", label:t("walkIn.checkout"),    value:checkOut },
              { icon:"🌙", label:t("walkIn.fieldNights"), value:`${nights} ${t("walkIn.nightsSummary")}` },
              { icon:"👥", label:t("walkIn.fieldGuests"), value:`${adults} ${t("walkIn.adults")}${children>0?`, ${children} ${t("walkIn.children")}`:""}`},
              { icon:"💰", label:t("walkIn.fieldTotal"),  value:`$${selectedRoom.roomPrice * nights}`, accent: true },
              { icon:"👤", label:t("walkIn.fieldGuest"),  value:guestName },
              { icon:"📧", label:t("users.cols.email"),   value:guestEmail },
              { icon:"💳", label:t("walkIn.fieldPay"),    value:payMethod==="cash"?t("walkIn.cashLabel"):"VNPay" },
            ].map(({icon,label,value,accent}) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between",
                padding:"10px 0", borderBottom:"1px solid #f0f2f5" }}>
                <span style={{ color:"#64748b", fontSize:"0.87rem" }}>{icon} {label}</span>
                <span style={{ fontWeight:600, color:accent?"#0d9488":"#1a1a2e" }}>{value}</span>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width:"100%", marginTop:20, padding:"14px", borderRadius:10, border:"none",
                background: submitting?"#99d6d0":"#0d9488", color:"#fff",
                fontWeight:700, fontSize:"1rem", cursor: submitting?"not-allowed":"pointer",
                boxShadow:"0 2px 8px rgba(13,148,136,0.3)" }}>
              {submitting ? t("walkIn.confirming") : t("walkIn.confirmBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkInBookingPage;
