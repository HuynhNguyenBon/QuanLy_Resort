import React, { useState } from 'react';
import ApiService from '../../service/ApiService'; // Giả sử dịch vụ của bạn nằm trong một tệp có tên là ApiService.js
import '../../UiverseElements.css';

const FindBookingPage = () => {
    const [confirmationCode, setConfirmationCode] = useState(''); // Biến trạng thái cho mã xác nhận
    const [bookingDetails, setBookingDetails] = useState(null); // Biến trạng thái cho chi tiết đặt phòng
    const [error, setError] = useState(null); // Theo dõi bất kỳ lỗi nào

    const handleSearch = async () => {
        if (!confirmationCode.trim()) {
            setError("Please Enter a booking confirmation code");
            setTimeout(() => setError(''), 5000);
            return;
        }
        try {
            // Gọi API để lấy chi tiết đặt phòng
            const response = await ApiService.getBookingByConfirmationCode(confirmationCode);
            setBookingDetails(response.booking);
            setError(null); // Xóa lỗi nếu thành công
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="find-booking-page">
            <h2 className="home-services text-center">Find Your <span className="bbhh-color">Reservation</span></h2>
            
            <div className="search-container-uiverse">
                <div className="uiverse-input-wrapper">
                    <input
                        required
                        type="text"
                        className="uiverse-input-field"
                        placeholder="Enter confirmation code (e.g. ABC123)"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                    />
                </div>
                <button className="btn-uiverse user" style={{maxWidth: '200px'}} onClick={handleSearch}>
                    Search Booking
                </button>
            </div>

            {error && <p className="text-center" style={{ color: 'red', fontWeight: '500' }}>{error}</p>}

            {bookingDetails && (
                <div className="booking-details-card">
                    <h3 className="booking-section-title">Booking Information</h3>
                    <div className="booking-info-grid">
                        <div className="info-item">
                            <label>Confirmation Code</label>
                            <span style={{color: '#ff9800'}}>{bookingDetails.bookingConfirmationCode}</span>
                        </div>
                        <div className="info-item">
                            <label>Check-in Date</label>
                            <span>{bookingDetails.checkInDate}</span>
                        </div>
                        <div className="info-item">
                            <label>Check-out Date</label>
                            <span>{bookingDetails.checkOutDate}</span>
                        </div>
                        <div className="info-item">
                            <label>Adults/Children</label>
                            <span>{bookingDetails.numOfAdults} Adults - {bookingDetails.numOfChildren} Children</span>
                        </div>
                    </div>

                    <h3 className="booking-section-title">Guest Details</h3>
                    <div className="booking-info-grid">
                        <div className="info-item">
                            <label>Full Name</label>
                            <span>{bookingDetails.user.name}</span>
                        </div>
                        <div className="info-item">
                            <label>Email Address</label>
                            <span>{bookingDetails.user.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Phone Number</label>
                            <span>{bookingDetails.user.phoneNumber}</span>
                        </div>
                    </div>

                    <h3 className="booking-section-title">Room Details</h3>
                    <div className="room-card-uiverse" style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
                        <div className="room-image-box" style={{width: '40%', height: '250px'}}>
                            <img src={bookingDetails.room.roomPhotoUrl} alt="Room" />
                        </div>
                        <div className="room-content-box" style={{width: '60%'}}>
                            <h4 className="room-title">{bookingDetails.room.roomType}</h4>
                            <p className="room-desc">Cảm ơn ông đã tin tưởng lựa chọn BBHH Resort. Chúc ông có một kỳ nghỉ tuyệt vời!</p>
                            <div className="room-price">Room Verified ✓</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindBookingPage;