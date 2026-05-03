import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService'; // Giả sử dịch vụ của bạn nằm trong một tệp có tên là ApiService.js
import DatePicker from 'react-datepicker';
import '../../UiverseElements.css';
// import 'react-datepicker/dist/react-datepicker.css';

const RoomDetailsPage = () => {
  const navigate = useNavigate(); // Truy cập chức năng điều hướng để di chuyển
  const { roomId } = useParams(); // Lấy ID phòng từ các tham số URL
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Theo dõi trạng thái tải
  const [error, setError] = useState(null); // Theo dõi bất kỳ lỗi nào
  const [checkInDate, setCheckInDate] = useState(null); // Biến trạng thái cho ngày nhận phòng
  const [checkOutDate, setCheckOutDate] = useState(null); // Biến trạng thái cho ngày trả phòng
  const [numAdults, setNumAdults] = useState(1); // Biến trạng thái cho số lượng người lớn
  const [numChildren, setNumChildren] = useState(0); // Biến trạng thái cho số lượng trẻ em
  const [totalPrice, setTotalPrice] = useState(0); // Biến trạng thái cho tổng giá đặt phòng
  const [totalGuests, setTotalGuests] = useState(1); // Biến trạng thái cho tổng số lượng khách
  const [showDatePicker, setShowDatePicker] = useState(false); // Biến trạng thái để kiểm soát khả năng hiển thị của date picker
  const [userId, setUserId] = useState(''); // Đặt ID người dùng
  const [showMessage, setShowMessage] = useState(false); // Biến trạng thái để kiểm soát khả năng hiển thị của thông báo
  const [confirmationCode, setConfirmationCode] = useState(''); // Biến trạng thái cho mã xác nhận đặt phòng
  const [errorMessage, setErrorMessage] = useState(''); // Biến trạng thái cho thông báo lỗi

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails(response.room);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomDetails();
  }, [roomId]);

  const handleConfirmBooking = () => {
    if (!checkInDate || !checkOutDate) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const total = days * roomDetails.roomPrice;
    setTotalPrice(total);
    setTotalGuests(numAdults + numChildren);
  };

  const acceptBooking = async () => {
    try {
      const userProfile = await ApiService.getUserProfile();
      const userId = userProfile.user.id;

      if (!userId) {
            alert("You need to log in again to make your booking!");
            return;
      }

      const formattedCheckInDate = checkInDate.toISOString().split('T')[0];
      const formattedCheckOutDate = checkOutDate.toISOString().split('T')[0];
      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        numOfAdults: numAdults,
        numOfChildren: numChildren,
      };
      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        alert("Booking Successful!");
        navigate('/profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  if (isLoading) return <div className="bbhh-loader-container"><div className="bbhh-spinner"></div></div>;

  return (
    <div className="bbhh-details-wrapper">
      <div className="bbhh-details-container">
        {error && <p className="bbhh-error-banner">{error}</p>}
        
        {roomDetails && (
          <div className="bbhh-details-grid">
            {/* Cột trái: Thông tin phòng */}
            <div className="bbhh-details-info">
              <div className="bbhh-image-frame">
                <img src={roomDetails.roomPhotoUrl} alt={roomDetails.roomType} />
                <div className="bbhh-room-badge">{roomDetails.roomType}</div>
              </div>
              <div className="bbhh-info-text">
                <h3>Room Amenities</h3>
                <p>{roomDetails.roomDescription || "Enjoy our luxury space with modern facilities and sea view."}</p>
                <div className="bbhh-price-circle">
                    <span>${roomDetails.roomPrice}</span> / night
                </div>
              </div>
            </div>

            {/* Cột phải: Form đặt phòng (Fix lỗi dàn trải) */}
            <div className="bbhh-booking-card">
              <div className="bbhh-card-header">
                <h3>Book This Room</h3>
                <div className="bbhh-underline-left"></div>
              </div>

              <div className="bbhh-date-selection">
                <div className="bbhh-input-box">
                  <label>Check-in</label>
                  <DatePicker
                    selected={checkInDate}
                    onChange={(date) => setCheckInDate(date)}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    placeholderText="Pick a date"
                    className="bbhh-date-input"
                  />
                </div>
                <div className="bbhh-input-box">
                  <label>Check-out</label>
                  <DatePicker
                    selected={checkOutDate}
                    onChange={(date) => setCheckOutDate(date)}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate}
                    placeholderText="Pick a date"
                    className="bbhh-date-input"
                  />
                </div>
              </div>

              <div className="bbhh-guest-selection">
                <div className="bbhh-input-box">
                  <label>Adults</label>
                  <input type="number" min="1" value={numAdults} onChange={(e) => setNumAdults(parseInt(e.target.value))} />
                </div>
                <div className="bbhh-input-box">
                  <label>Children</label>
                  <input type="number" min="0" value={numChildren} onChange={(e) => setNumChildren(parseInt(e.target.value))} />
                </div>
              </div>

              <button className="bbhh-btn-calculate" onClick={handleConfirmBooking}>Check Total Price</button>

              {totalPrice > 0 && (
                <div className="bbhh-summary-box">
                  <div className="summary-row"><span>Total Guests:</span> <strong>{totalGuests}</strong></div>
                  <div className="summary-row"><span>Total Amount:</span> <strong className="text-orange">${totalPrice}</strong></div>
                  <button onClick={acceptBooking} className="bbhh-btn-confirm-final">Confirm Reservation</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;