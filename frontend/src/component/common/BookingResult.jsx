import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BookingResult = ({ bookingSearchResults }) => {
  const { t } = useTranslation("common");

  return (
    <div className="booking-results">
      {bookingSearchResults.map((booking) => (
        <div key={booking.id} className="booking-result-item">
          <p>
            {t("bookingResult.roomId")}: {booking.roomId}
          </p>

          <p>
            {t("bookingResult.userId")}: {booking.userId}
          </p>

          <p>
            {t("bookingResult.startDate")}: {booking.startDate}
          </p>

          <p>
            {t("bookingResult.endDate")}: {booking.endDate}
          </p>

          <p>
            {t("bookingResult.status")}: {booking.status}
          </p>

          <Link to={`/admin/edit-booking/${booking.id}`} className="edit-link">
            {t("bookingResult.edit")}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default BookingResult;
