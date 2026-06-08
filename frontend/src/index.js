import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Khôi phục phiên đăng nhập nếu trình duyệt đã xoá localStorage trong lúc
// chuyển hướng qua cổng thanh toán VNPay (xem ghi chú ở RoomDetailsPage.jsx).
// Phải chạy trước khi React render để Navbar đọc đúng trạng thái đăng nhập
// ngay từ lần render đầu tiên.
(function restoreAuthAfterPaymentRedirect() {
  if (localStorage.getItem("token")) return;
  const backupRaw = sessionStorage.getItem("bbhh_auth_backup");
  if (!backupRaw) return;
  try {
    const { token, role, userEmail } = JSON.parse(backupRaw);
    if (token) {
      localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);
      if (userEmail) localStorage.setItem("userEmail", userEmail);
    }
  } catch {
    // bỏ qua bản sao lưu hỏng
  }
  sessionStorage.removeItem("bbhh_auth_backup");
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
