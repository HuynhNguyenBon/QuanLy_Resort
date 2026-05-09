import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';
import '../../UiverseElements.css';

const ManageBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(6);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await ApiService.getAllBookings();
                const allBookings = response.bookingList;
                setBookings(allBookings);
                setFilteredBookings(allBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error.message);
            }
        };

        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings(searchTerm);
    }, [searchTerm, bookings]);

    const filterBookings = (term) => {
        if (term === '') {
            setFilteredBookings(bookings);
        } else {
            const filtered = bookings.filter((booking) =>
                booking.bookingConfirmationCode && booking.bookingConfirmationCode.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredBookings(filtered);
        }
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="bbhh-profile-container">
            <div className="bbhh-profile-card">
       
                <div className="bbhh-profile-header">
                    <h2>Manage <span className="text-orange">Bookings</span></h2>
                    <div className="bbhh-search-box">
                        <input
                            type="text"
                            className="bbhh-input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search by confirmation code..."
                        />
                    </div>
                </div>

                <div className="bbhh-booking-grid">
                    {currentBookings.length > 0 ? (
                        currentBookings.map((booking) => (
                            <div key={booking.id} className="bbhh-box bbhh-booking-card">
                                <div className="bbhh-card-header">
                                    <span className="bbhh-tag">Code: {booking.bookingConfirmationCode}</span>
                                </div>
                                <div className="bbhh-divider"></div>
                                <div className="bbhh-card-body">
                                    <p><strong>Check-in:</strong> {booking.checkInDate}</p>
                                    <p><strong>Check-out:</strong> {booking.checkOutDate}</p>
                                    <p><strong>Guests:</strong> {booking.totalNumOfGuest}</p>
                                </div>
                                <button
                                    className="bbhh-btn bbhh-btn-edit w-100"
                                    onClick={() => navigate(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
                                >
                                    Manage Details
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No bookings found matching your search.</p>
                    )}
                </div>

                <div className="bbhh-pagination-container">
                    <Pagination
                        roomsPerPage={bookingsPerPage}
                        totalRooms={filteredBookings.length}
                        currentPage={currentPage}
                        paginate={paginate}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageBookingsPage;