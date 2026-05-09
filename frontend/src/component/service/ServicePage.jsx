import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';
import '../../UiverseElements.css';

const imageMap = {
    'High-Speed Wi-Fi': 'wifi.png',
    'Air Conditioning': 'ac.png',
    'Luxury Mini Bar': 'mini-bar.png',
    'Gourmet Breakfast': 'breakfast.png',
    'Infinity Swimming Pool': 'pool.png',
    'Spa & Wellness Center': 'spa.png',
    'Airport Shuttle Service': 'airport-transfer.png',
    'Modern Fitness Center': 'gym.png',
    'Laundry & Dry Cleaning': 'laundry.png',
    'Room Service 24/7': 'room-service.png',
    'Secure Parking': 'parking.png'
};

const ServicePage = () => {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await ApiService.getAllServices();
                setServices(response.serviceList || response);
                setError(null); // Thành công thì xóa lỗi cũ (nếu có)
            } catch (err) {
                // In ra console để dev xem chứ không làm sập giao diện
                console.error("Service API Error:", err);
                
                // Lưu thông báo lỗi thân thiện vào state
                if (err.response?.status === 403) {
                    setError("You need to log in to view these services!");
                } else {
                    setError("Cannot load service list. Please try again later!");
                }
            } finally {
                setIsLoading(false); // Dù lỗi hay thành công cũng tắt vòng xoay loader
            }
        };

        fetchServices();
    }, []);

    return (
        <div className="service-page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>
            <h2 className="home-services">Our Exclusive <span className="bbhh-color">Services</span></h2>
            
            {isLoading ? (
                <div className="loader-container">
                    <div className="luxury-loader"></div>
                </div>
            ) : error ? (
                // Nếu bị lỗi, hiện thông báo nhẹ nhàng thay vì sập giao diện
                <div style={{ marginTop: '30px', color: '#ff9800', fontSize: '1.2rem' }}>
                    <p>{error}</p>
                    <button 
                        className="btn-uiverse user" 
                        style={{ maxWidth: '200px', margin: '20px auto' }}
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="service-grid-uiverse">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div className="service-card-uiverse" key={service.id}>
                                <img 
                                    src={`./assets/images/${imageMap[service.name] || 'wifi.png'}`} 
                                    alt={service.name} 
                                    onError={(e) => { e.target.src = "./assets/images/wifi.png" }}
                                />
                                <div className="service-details">
                                    <h3 className="service-title">{service.name}</h3>
                                    <p className="service-description">{service.description}</p>
                                    <p style={{ fontWeight: 'bold', color: '#ff9800' }}>Price: ${service.price}</p>
                                    
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center" style={{ gridColumn: '1 / -1' }}>No services available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServicePage;