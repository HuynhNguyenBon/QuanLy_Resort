# 🏨 BBTT Resort Management System

Dự án quản lý khách sạn và đặt phòng trực tuyến được xây dựng với **Spring Boot** (Backend) và **ReactJS** (Frontend).

## 🌟 Tính năng chính

### Đối với khách hàng (User):
- **Đăng ký/Đăng nhập:** Bảo mật mật khẩu bằng BCrypt, kiểm tra định dạng email và độ mạnh mật khẩu (chữ hoa, số, ký tự đặc biệt).
- **Tìm kiếm phòng:** Tìm kiếm theo loại phòng và thời gian trống.
- **Đặt phòng:** Quy trình đặt phòng nhanh chóng, quản lý lịch sử đặt phòng cá nhân.
- **Đa ngôn ngữ:** Hỗ trợ Tiếng Anh và Tiếng Việt (i18n).

### Đối với quản trị viên (Admin):
- **Quản lý phòng:** Thêm, sửa, xóa thông tin phòng và hình ảnh.
- **Quản lý đặt phòng:** Xem và điều phối các đơn đặt phòng của khách hàng.
- **Quản lý người dùng:** Kiểm soát danh sách khách hàng.

## 🛠 Công nghệ sử dụng

- **Frontend:** ReactJS, Axios, React Router, CSS3, i18next.
- **Backend:** Java Spring Boot, Spring Security (JWT), Hibernate/JPA.
- **Database:** MySQL.
- **Security:** Mã hóa mật khẩu BCrypt, xác thực phân quyền Admin/User.

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống:
- Java 17 trở lên.
- Node.js & npm.
- MySQL Server.

### 2. Cấu hình Backend:
- Mở `src/main/resources/application.properties`.
- Chỉnh sửa thông tin kết nối Database:
- 
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
  spring.datasource.username=your_username
  spring.datasource.password=your_password
  
- Chạy ứng dụng Spring Boot.
### 3. Cấu hình Frontend:
- Di chuyển vào thư mục frontend:
    cd tên-thư-mục-frontend-của-bạn
    npm install
    npm start
- Ứng dụng sẽ chạy tại: http://localhost:3000
