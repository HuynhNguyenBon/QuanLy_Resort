import React, { useState } from "react";
import ApiService from "../../service/ApiService";

const ResetPasswordPage = () => {

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newPassword: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.email.trim()) {
            alert("Please enter email");
            return;
        }

        if (!form.otp.trim()) {
            alert("Please enter OTP");
            return;
        }

        if (!form.newPassword.trim()) {
            alert("Please enter new password");
            return;
        }

        try {

            setLoading(true);

            const response = await ApiService.resetPassword(
                form.email,
                form.otp,
                form.newPassword
            );

            alert(response.data.message);

            window.location.href = "/login";

        } catch (error) {

            if (error.response) {

                alert(
                    error.response.data.message ||
                    "Reset password failed"
                );

            } else {

                alert("Server error");
            }

        } finally {

            setLoading(false);
        }
    };

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f6f9"
            }}
        >

            <div
                className="auth-container"
                style={{
                    width: "400px",
                    background: "#fff",
                    padding: "35px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
            >

                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "25px",
                        color: "#333"
                    }}
                >
                    Reset Password
                </h2>

                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="off"
                        style={{
                            marginBottom: "15px",
                            padding: "12px",
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "15px",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                    />

                    <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        value={form.otp}
                        onChange={handleChange}
                        autoComplete="off"
                        style={{
                            marginBottom: "15px",
                            padding: "12px",
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "15px",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                    />

                    <input
                        type="password"
                        name="newPassword"
                        placeholder="Enter New Password"
                        value={form.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        style={{
                            marginBottom: "18px",
                            padding: "12px",
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "15px",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "12px",
                            width: "100%",
                            border: "none",
                            borderRadius: "8px",
                            background: "#007bff",
                            color: "#fff",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.3s"
                        }}
                    >

                        {loading ? "Resetting..." : "Reset Password"}

                    </button>

                </form>

            </div>

        </div>
    );
};

export default ResetPasswordPage;