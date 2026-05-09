import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import '../../UiverseElements.css';

const RoomResult = ({ roomSearchResults }) => {
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();

    return (
        <section className="room-results">
            {roomSearchResults && roomSearchResults.length > 0 && (
                <div className="room-list-uiverse">
                    {roomSearchResults.map(room => (
                        <RoomCard 
                            key={room.id} 
                            room={room} 
                            isAdmin={isAdmin} 
                            navigate={navigate} 
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

const RoomCard = ({ room, isAdmin, navigate }) => (
    <div className="room-card-uiverse">
        <div className="room-image-box">
            <img src={room.roomPhotoUrl} alt={room.roomType} />
        </div>
        <div className="room-content-box">
            <h3 className="room-title">{room.roomType}</h3>
            <p className="room-price">
                {room.roomPrice?.toLocaleString('vi-VN')} $ / night
            </p>
            <p className="room-desc">{room.roomDescription}</p>
            
            <div className="room-amenities-tags">
                <span>📶 Wifi</span>
                <span>🏊 Hồ bơi</span>
                <span>❄️ Máy lạnh</span>
            </div>
            
            <div className="room-actions">
                {isAdmin ? (
                    <button
                        className="btn-uiverse admin"
                        onClick={() => navigate(`/admin/edit-room/${room.id}`)}
                    >
                        Edit Room
                    </button>
                ) : (
                    <button
                        className="btn-uiverse user"
                        onClick={() => navigate(`/room-details-book/${room.id}`)}
                    >
                        View / Book Now
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default RoomResult;