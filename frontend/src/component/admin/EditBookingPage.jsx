import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService'; // Assuming your service is in a file called ApiService.js

const EditBookingPage = () => {
    const navigate = useNavigate();
    const { bookingCode } = useParams();
    const [bookingDetails, setBookingDetails] = useState(null); // State variable for booking details
    const [error, setError] = useState(null); // Track any errors
    const [success, setSuccessMessage] = useState(null); // Track any errors



    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await ApiService.getBookingByConfirmationCode(bookingCode);
                setBookingDetails(response.booking);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchBookingDetails();
    }, [bookingCode]);


    const acheiveBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to Acheive this booking?')) {
            return; // Do nothing if the user cancels
        }

        try {
            const response = await ApiService.cancelBooking(bookingId);
            if (response.statusCode === 200) {
                setSuccessMessage("The boking was Successfully Acheived")
                
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/admin/manage-bookings');
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="bbhh-manage-booking-wrapper">
            <div className="bbhh-manage-glass-card">
                
                {/* Header: Gom gọn tiêu đề và nút Back */}
                <div className="bbhh-manage-header">
                    <h2>Manage Booking: <span className="text-orange">{bookingCode}</span></h2>
                    <div className="bbhh-divider-uiverse"></div>
                    <button className="bbhh-btn-back-uiverse" onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>

                {error && <div className="uiverse-error-banner">{error}</div>}
                {success && <div className="uiverse-success-banner">{success}</div>}

                {bookingDetails && (
                    <div className="bbhh-manage-body">
                        {/* Phần 1: Ảnh và Thông tin phòng đã đặt */}
                        <div className="room-reservation-summary">
                            <div className="summary-img-frame">
                                <img src={bookingDetails.room.roomPhotoUrl} alt="Reserved Room" />
                            </div>
                            <div className="summary-details">
                                <div className="field-group">
                                    <label>Room Type</label>
                                    <span>{bookingDetails.room.roomType}</span>
                                </div>
                                <div className="field-group price">
                                    <label>Price</label>
                                    <span>${bookingDetails.room.roomPrice} / night</span>
                                </div>
                            </div>
                        </div>

                        <hr className="bbhh-manage-hr" />

                        {/* Phần 2: Chi tiết đặt phòng và Thông tin khách (Dạng thẻ con kính mờ) */}
                        <div className="booking-info-details">
                            <div className="info-glass-box">
                                <h3>Booking Details</h3>
                                <div className="field-group">
                                    <label>Check-in Date</label>
                                    <div className="field-value">{bookingDetails.checkInDate}</div>
                                </div>
                                <div className="field-group">
                                    <label>Check-out Date</label>
                                    <div className="field-value">{bookingDetails.checkOutDate}</div>
                                </div>
                                <div className="guests-flex">
                                    <div className="field-group">
                                        <label>Adults</label>
                                        <div className="field-value">{bookingDetails.numOfAdults}</div>
                                    </div>
                                    <div className="field-group">
                                        <label>Children</label>
                                        <div className="field-value">{bookingDetails.numOfChildren}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="info-glass-box">
                                <h3>Booker Information</h3>
                                <div className="field-group">
                                    <label>Full Name</label>
                                    <div className="field-value">{bookingDetails.user.name}</div>
                                </div>
                                <div className="field-group">
                                    <label>Email Address</label>
                                    <div className="field-value">{bookingDetails.user.email}</div>
                                </div>
                                <div className="field-group">
                                    <label>Phone Number</label>
                                    <div className="field-value">{bookingDetails.user.phoneNumber}</div>
                                </div>
                            </div>
                        </div>

                        {/* Phần 3: Nút hành động */}
                        <div className="bbhh-manage-actions">
                            <button 
                                className="bbhh-btn-achieve" 
                                onClick={() => acheiveBooking(bookingDetails.id)}
                            >
                                Achieve Booking
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditBookingPage;