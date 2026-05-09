import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from '../../service/ApiService';
import '../../UiverseElements.css';

const AdminPage = () => {
    const [adminName, setAdminName] = useState('');
    const navigate = useNavigate();

    const stats = [
        { label: 'Single', value: 80, color: '#0088FE' },
        { label: 'Double', value: 65, color: '#00C49F' },
        { label: 'Luxury', value: 45, color: '#FFBB28' },
        { label: 'Suite', value: 30, color: '#FF8042' },
    ];

    useEffect(() => {
        const fetchAdminName = async () => {
            try {
                const response = await ApiService.getUserProfile();
                setAdminName(response.user.name);
            } catch (error) {
                console.error('Error fetching admin details:', error.message);
            }
        };

        fetchAdminName();
    }, []);

    return (
        <div className="bbhh-profile-container">
            <div className="bbhh-profile-card">
                
                <div className="bbhh-profile-header">
                    <h2 className="welcome-message">
                        Welcome, <span className="text-orange">{adminName}</span>
                    </h2>
                    
                    <div className="bbhh-action-buttons">
                        <button className="bbhh-btn bbhh-btn-edit" onClick={() => navigate('/admin/manage-rooms')}>
                            Manage Rooms
                        </button>
                        <button className="bbhh-btn bbhh-btn-logout" onClick={() => navigate('/admin/manage-bookings')}>
                            Manage Bookings
                        </button>
                    </div>
                </div>

                <div className="bbhh-profile-body">
                    {/* Cột trái: Thông tin hệ thống*/}
                    <div className="bbhh-box">
                        <h3>System Status</h3>
                        <div className="bbhh-divider"></div>
                        <p><strong>Server:</strong> <span style={{color: '#28a745'}}>Online</span></p>
                        <p><strong>Database:</strong> Connected</p>
                        <p><strong>Total Staff:</strong> 05</p>
                        <div style={{marginTop: '15px', padding: '10px', background: '#e7f3ff', borderRadius: '8px', fontSize: '0.85rem'}}>
                            Quick Tip: Check the booking management daily to keep high guest satisfaction.
                        </div>
                    </div>

                    {/* Cột phải: BIỂU ĐỒ */}
                    <div className="bbhh-box">
                        <h3>Room Popularity</h3>
                        <div className="bbhh-divider"></div>
                        
                        <div style={{ marginTop: '20px' }}>
                            {stats.map((item, index) => (
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                                        <span>{item.label}</span>
                                        <span>{item.value}%</span>
                                    </div>
                                    {/* Thanh Bar vẽ bằng div */}
                                    <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${item.value}%`, 
                                            height: '100%', 
                                            background: item.color,
                                            transition: 'width 1s ease-in-out' 
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bbhh-profile-footer">
                    <p>BBHH Resort | Administrator Control Panel</p>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
