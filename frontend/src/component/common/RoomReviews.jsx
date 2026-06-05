import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = (id) => `bbhh_reviews_${id}`;

const StarInput = ({ value, onChange }) => (
  <div className="rv-star-input">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`rv-star-btn${value >= n ? " lit" : ""}`}
        onClick={() => onChange(n)}
        aria-label={`${n} sao`}
      >
        ★
      </button>
    ))}
  </div>
);

const StarDisplay = ({ value }) => (
  <span className="rv-stars-display">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={n <= value ? "rv-star-lit" : "rv-star-dim"}>
        ★
      </span>
    ))}
  </span>
);

const RoomReviews = ({ roomId, roomType }) => {
  const { t, i18n } = useTranslation("reviews");
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY(roomId)) || "[]",
      );
      setReviews(stored);
    } catch {
      setReviews([]);
    }
  }, [roomId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErr(t("yourNameError"));
      return;
    }
    if (!form.comment.trim()) {
      setErr(t("commentError"));
      return;
    }
    const review = {
      ...form,
      date: new Date().toLocaleDateString("vi-VN"),
      id: Date.now(),
    };
    const next = [review, ...reviews];
    setReviews(next);
    localStorage.setItem(STORAGE_KEY(roomId), JSON.stringify(next));
    setForm({ name: "", rating: 5, comment: "" });
    setShowForm(false);
    setErr("");
  };

  return (
    <div className="rv-wrap">
      <div className="rv-header">
        <div>
          <h3 className="rv-title">{t("reviewsTitle")}</h3>
          {avgRating && (
            <div className="rv-avg">
              <span className="rv-avg-num">{avgRating}</span>
              <StarDisplay value={Math.round(avgRating)} />
              <span className="rv-avg-count">
                ({reviews.length} {t("avgLabel")})
              </span>
            </div>
          )}
        </div>
        <button className="rv-write-btn" onClick={() => setShowForm((p) => !p)}>
          {showForm ? t("cancel") : t("writeReview")}
        </button>
      </div>

      {showForm && (
        <form className="rv-form" onSubmit={submit}>
          <h4 className="rv-form-title">{t("reviewRoom", { roomType })}</h4>
          <div className="rv-form-row">
            <label>{t("yourName")}</label>
            <input
              type="text"
              placeholder={t("namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              maxLength={60}
            />
          </div>
          <div className="rv-form-row">
            <label>{t("rating")}</label>
            <StarInput
              value={form.rating}
              onChange={(r) => setForm((p) => ({ ...p, rating: r }))}
            />
          </div>
          <div className="rv-form-row">
            <label>{t("comment")}</label>
            <textarea
              placeholder={t("commentPlaceholder")}
              value={form.comment}
              onChange={(e) =>
                setForm((p) => ({ ...p, comment: e.target.value }))
              }
              rows={4}
              maxLength={500}
            />
          </div>
          {err && <p className="rv-err">{err}</p>}
          <button type="submit" className="rv-submit-btn">
            {t("submit")}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="rv-empty">
          <div className="rv-empty-icon">💬</div>
          <p>{t("noReviews")}</p>
        </div>
      ) : (
        <div className="rv-list">
          {reviews.map((r) => (
            <div key={r.id} className="rv-card">
              <div className="rv-card-top">
                <div className="rv-avatar">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="rv-name">{r.name}</div>
                  <div className="rv-date">{r.date}</div>
                </div>
                <div className="rv-card-stars">
                  <StarDisplay value={r.rating} />
                </div>
              </div>
              <p className="rv-comment">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomReviews;
