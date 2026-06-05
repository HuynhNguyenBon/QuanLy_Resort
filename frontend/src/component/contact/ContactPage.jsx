import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../../UiverseElements.css";

const ContactPage = () => {
  const { t } = useTranslation("contact");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const infoItems = t("infoItems", { returnObjects: true });
  const subjects = t("subjects", { returnObjects: true });

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-inner">
          <p className="contact-hero-tag">{t("heroTag")}</p>
          <h1 className="contact-hero-h1">
            {t("heroTitle1")} <span className="accent">{t("heroAccent")}</span>{" "}
            <span style={{ whiteSpace: "nowrap" }}>{t("heroTitle2")}</span>
          </h1>
          <p className="contact-hero-sub">{t("heroSub")}</p>
        </div>
      </div>

      <div className="contact-body">
        <div className="contact-inner">
          <div className="contact-info-grid">
            {infoItems.map((item, i) => (
              <div key={i} className="contact-info-card">
                <span className="contact-info-icon">{item.icon}</span>
                <div>
                  <div className="contact-info-label">{item.label}</div>
                  <div className="contact-info-value">{item.value}</div>
                  <div className="contact-info-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-form-card">
            <h2 className="contact-form-title">{t("formTitle")}</h2>
            {sent && (
              <div className="contact-success">✅ {t("successMsg")}</div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>
                    {t("nameLabel")} {t("required")}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("namePlaceholder")}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label>
                    {t("emailLabel")} {t("required")}
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>{t("phoneLabel")}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={t("phonePlaceholder")}
                  />
                </div>
                <div className="contact-field">
                  <label>
                    {t("subjectLabel")} {t("required")}
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t("subjectPlaceholder")}</option>
                    {subjects.map((s, i) => (
                      <option key={i}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="contact-field">
                <label>
                  {t("messageLabel")} {t("required")}
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={t("messagePlaceholder")}
                  required
                />
              </div>
              <button type="submit" className="contact-submit-btn">
                📨 {t("submitBtn")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
