import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import '../../UiverseElements.css';

const EditProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await ApiService.getUserProfile();
                setUser(response.user);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleDeleteProfile = async () => {
        if (!window.confirm('Are you sure you want to delete your account?')) {
            return;
        }
        try {
            await ApiService.deleteUser(user.id);
            navigate('/signup');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="bbhh-edit-profile-wrapper">
            <div className="bbhh-edit-card">
                <div className="bbhh-edit-header">
                    <h2>Edit Your <span className="text-orange">Profile</span></h2>
                    <div className="bbhh-divider-center"></div>
                </div>

                {error && <div className="bbhh-error-banner">{error}</div>}

                {user && (
                    <div className="bbhh-edit-content">
                        <div className="bbhh-info-display">
                            <div className="bbhh-info-group">
                                <label>Full Name</label>
                                <div className="bbhh-read-only-field">{user.name}</div>
                            </div>

                            <div className="bbhh-info-group">
                                <label>Email Address</label>
                                <div className="bbhh-read-only-field">{user.email}</div>
                            </div>

                            <div className="bbhh-info-group">
                                <label>Phone Number</label>
                                <div className="bbhh-read-only-field">{user.phoneNumber}</div>
                            </div>
                        </div>

                        <div className="bbhh-edit-actions">
                            <p className="warning-text">Warning: Deleting your profile is permanent and cannot be undone.</p>
                            <button className="bbhh-btn-danger" onClick={handleDeleteProfile}>
                                Delete My Account
                            </button>
                            <button className="bbhh-btn-back" onClick={() => navigate('/profile')}>
                                Back to Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditProfilePage;
