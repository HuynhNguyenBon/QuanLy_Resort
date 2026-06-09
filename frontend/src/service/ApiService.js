import axios from "axios";

export default class ApiService {
  static BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4040";

  static getHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**AUTH */

  /* Đăng ký người dùng mới */
  static async registerUser(registration) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register`,
      registration,
    );
    return response.data;
  }

  /* Đăng nhập này là người dùng đã đăng ký */
  static async loginUser(loginDetails) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/login`,
      loginDetails,
    );
    return response.data;
  }

  static async forgotPassword(email) {
    return axios.post(
      `${this.BASE_URL}/auth/forgot-password`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );
  }

  static async verifyEmail(email, otp) {
    return axios.post(
      `${this.BASE_URL}/auth/verify-email`,
      { email, otp },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );
  }

  static async resendVerificationOtp(email) {
    return axios.post(
      `${this.BASE_URL}/auth/resend-verification-otp`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );
  }

  static async resetPassword(email, otp, newPassword) {
    return axios.post(
      `${this.BASE_URL}/auth/reset-password`,
      {
        email,
        otp,
        newPassword,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  /***USERS */

  /*  Việc này nhằm mục đích lấy thông tin hồ sơ người dùng */
  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/users/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getUserProfile() {
    const response = await axios.get(
      `${this.BASE_URL}/users/get-logged-in-profile-info`,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  /* Đây là cách để có được một người dùng duy nhất */
  static async getUser(userId) {
    const response = await axios.get(
      `${this.BASE_URL}/users/get-by-id/${userId}`,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  /* Đây là cách để lấy thông tin đặt chỗ của người dùng dựa trên ID người dùng */
  static async getUserBookings(userId) {
    const response = await axios.get(
      `${this.BASE_URL}/users/get-user-bookings/${userId}`,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  /* Thao tác này nhằm xóa người dùng */
  static async updateUser(userId, userData) {
    const response = await axios.put(
      `${this.BASE_URL}/users/update/${userId}`,
      userData,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  static async deleteUser() {
    const response = await axios.delete(
      `${this.BASE_URL}/users/delete-my-account`,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  /**ROOM */
  /* Thao tác này thêm một phòng mới vào cơ sở dữ liệu */
  static async addRoom(formData) {
    const result = await axios.post(`${this.BASE_URL}/rooms/add`, formData, {
      headers: {
        ...this.getHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return result.data;
  }

  /* Sẽ giúp có được tất cả các phòng còn trống */
  static async getAllAvailableRooms() {
    const result = await axios.get(
      `${this.BASE_URL}/rooms/all-available-rooms`,
    );
    return result.data;
  }

  /* Thao tác này sẽ lấy tất cả các phòng còn trống theo ngày từ cơ sở dữ liệu với ngày và loại phòng đã cho */
  static async getAvailableRoomsByDateAndType(
    checkInDate,
    checkOutDate,
    roomType,
  ) {
    const result = await axios.get(
      `${this.BASE_URL}/rooms/available-rooms-by-date-and-type?checkInDate=${checkInDate}
		&checkOutDate=${checkOutDate}&roomType=${roomType}`,
    );
    return result.data;
  }

  /* Điều này giúp lấy tất cả các loại phòng từ cơ sở dữ liệu */
  static async getRoomTypes() {
    const response = await axios.get(`${this.BASE_URL}/rooms/types`);
    return response.data;
  }
  /* Thao tác này lấy tất cả các phòng từ cơ sở dữ liệu */
  static async getAllRooms() {
    const result = await axios.get(`${this.BASE_URL}/rooms/all`);
    return result.data;
  }
  /* Chức năng này lấy thông tin phòng dựa trên ID */
  static async getRoomById(roomId) {
    const result = await axios.get(
      `${this.BASE_URL}/rooms/room-by-id/${roomId}`,
    );
    return result.data;
  }

  static async getRoomTranslation(roomId, language) {
    const result = await axios.get(
      `${this.BASE_URL}/translations/${roomId}/${language}`,
    );
    return result.data;
  }

  static async saveRoomTranslation(roomId, language, data) {
    const result = await axios.post(
      `${this.BASE_URL}/translations/${roomId}/${language}`,
      data,
      { headers: this.getHeader() },
    );
    return result.data;
  }

  /* Thao tác này xóa một phòng theo ID */
  static async deleteRoom(roomId) {
    const result = await axios.delete(
      `${this.BASE_URL}/rooms/delete/${roomId}`,
      {
        headers: this.getHeader(),
      },
    );
    return result.data;
  }

  /* Việc này giúp cập nhật một căn phòng*/
  static async updateRoom(roomId, formData) {
    const result = await axios.put(
      `${this.BASE_URL}/rooms/update/${roomId}`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return result.data;
  }

  static async checkRoomAvailability(roomId, checkInDate, checkOutDate) {
    const response = await axios.get(
      `${this.BASE_URL}/bookings/check-availability?roomId=${roomId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
    );
    return response.data;
  }

  /**BOOKING */
  /* Thao tác này sẽ lưu một đặt chỗ mới vào cơ sở dữ liệu */
  static async bookRoom(roomId, userId, booking) {
    console.log("USER ID IS: " + userId);

    const response = await axios.post(
      `${this.BASE_URL}/bookings/book-room/${roomId}/${userId}`,
      booking,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  /* Thao tác này lấy tất cả các đặt chỗ từ cơ sở dữ liệu */
  static async getAllBookings() {
    const result = await axios.get(`${this.BASE_URL}/bookings/all`, {
      headers: this.getHeader(),
    });
    return result.data;
  }

  /* Có thể đặt phòng bằng mã xác nhận */
  static async getBookingByConfirmationCode(bookingCode) {
    const result = await axios.get(
      `${this.BASE_URL}/bookings/get-by-confirmation-code/${bookingCode}`,
    );
    return result.data;
  }

  /* Đây là cách để hủy đặt chỗ của người dùng */
  static async cancelBooking(bookingId) {
    const result = await axios.delete(
      `${this.BASE_URL}/bookings/cancel/${bookingId}`,
      {
        headers: this.getHeader(),
      },
    );
    return result.data;
  }

  static async updateBooking(bookingId, bookingData) {
    const result = await axios.put(
      `${this.BASE_URL}/bookings/update/${bookingId}`,
      bookingData,
      {
        headers: this.getHeader(),
      },
    );
    return result.data;
  }

  /**AUTHENTICATION CHECKER */
  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
  }

  static isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  static isAdmin() {
    const role = localStorage.getItem("role");
    return role?.toUpperCase() === "ADMIN";
  }

  static isStaff() {
    const role = localStorage.getItem("role");
    return role?.toUpperCase() === "STAFF";
  }

  static isUser() {
    const role = localStorage.getItem("role");
    return role?.toUpperCase() === "USER";
  }

  static async setUserRole(userId, role) {
    const response = await axios.put(
      `${this.BASE_URL}/users/set-role/${userId}`,
      { role },
      { headers: this.getHeader() },
    );
    return response.data;
  }
  // Lấy danh sách tất cả dịch vụ (public, không cần đăng nhập)
  static async getAllServices() {
    const response = await axios.get(`${this.BASE_URL}/services/all`);
    return response.data;
  }

  // Lấy thông tin 1 dịch vụ theo ID
  static async getServiceById(serviceId) {
    const response = await axios.get(`${this.BASE_URL}/services/${serviceId}`);
    return response.data;
  }

  // (Dành cho Admin) Thêm dịch vụ mới
  static async addService(serviceData) {
    const params = new URLSearchParams();
    params.append("name", serviceData.name);
    params.append("description", serviceData.description);
    params.append("price", serviceData.price ?? 0);
    const response = await axios.post(`${this.BASE_URL}/services/add`, params, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  }

  // (Dành cho Admin) Cập nhật dịch vụ
  static async updateService(serviceId, serviceData) {
    const params = new URLSearchParams();
    params.append("name", serviceData.name);
    params.append("description", serviceData.description);
    params.append("price", serviceData.price ?? 0);
    const response = await axios.put(
      `${this.BASE_URL}/services/update/${serviceId}`,
      params,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  }

  // (Dành cho Admin) Xóa dịch vụ
  static async deleteService(serviceId) {
    const response = await axios.delete(
      `${this.BASE_URL}/services/delete/${serviceId}`,
      {
        headers: this.getHeader(),
      },
    );
    return response.data;
  }

  // =================== STAFF PROFILES (Admin) ===================
  static async getAllStaffProfiles() {
    const response = await axios.get(`${this.BASE_URL}/staff-profiles/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async addStaffProfile(staffData) {
    const params = new URLSearchParams();
    params.append("name", staffData.name ?? "");
    params.append("email", staffData.email ?? "");
    params.append("phoneNumber", staffData.phoneNumber ?? "");
    params.append("role", staffData.role ?? "");
    params.append("startDate", staffData.startDate ?? "");
    params.append("note", staffData.note ?? "");
    params.append("hasAccount", staffData.hasAccount ?? false);
    const response = await axios.post(
      `${this.BASE_URL}/staff-profiles/add`,
      params,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  }

  static async updateStaffProfile(staffId, staffData) {
    const params = new URLSearchParams();
    params.append("name", staffData.name ?? "");
    params.append("email", staffData.email ?? "");
    params.append("phoneNumber", staffData.phoneNumber ?? "");
    params.append("role", staffData.role ?? "");
    params.append("startDate", staffData.startDate ?? "");
    params.append("note", staffData.note ?? "");
    const response = await axios.put(
      `${this.BASE_URL}/staff-profiles/update/${staffId}`,
      params,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  }

  static async deleteStaffProfile(staffId) {
    const response = await axios.delete(
      `${this.BASE_URL}/staff-profiles/delete/${staffId}`,
      { headers: this.getHeader() },
    );
    return response.data;
  }

  // =================== REVIEWS ===================
  static async getReviewsByRoom(roomId) {
    const response = await axios.get(`${this.BASE_URL}/reviews/room/${roomId}`);
    return response.data;
  }

  // (Dành cho Admin) Lấy tất cả đánh giá
  static async getAllReviews() {
    const response = await axios.get(`${this.BASE_URL}/reviews/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  // Gửi đánh giá mới (khách không cần đăng nhập)
  static async addReview(roomId, reviewData) {
    const params = new URLSearchParams();
    params.append("roomId", roomId);
    params.append("name", reviewData.name);
    params.append("rating", reviewData.rating);
    params.append("comment", reviewData.comment);
    const response = await axios.post(`${this.BASE_URL}/reviews/add`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  }

  // (Dành cho Admin) Xoá 1 đánh giá
  static async deleteReview(reviewId) {
    const response = await axios.delete(
      `${this.BASE_URL}/reviews/delete/${reviewId}`,
      { headers: this.getHeader() },
    );
    return response.data;
  }

  // (Dành cho Admin) Xoá toàn bộ đánh giá của 1 phòng
  static async deleteReviewsByRoom(roomId) {
    const response = await axios.delete(
      `${this.BASE_URL}/reviews/room/${roomId}`,
      { headers: this.getHeader() },
    );
    return response.data;
  }

  // =================== VNPAY ===================
  static async createVNPayPayment(bookingId) {
    const response = await axios.post(
      `${this.BASE_URL}/payment/create`,
      { bookingId },
      { headers: this.getHeader() },
    );
    return response.data;
  }

  static async getVNPayReturn(params) {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${this.BASE_URL}/payment/vnpay-return?${query}`,
    );
    return response.data;
  }
}
// export default new ApiService();
