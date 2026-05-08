
import axios from "axios"

export default class ApiService {

    static BASE_URL = "http://localhost:4040"

    static getHeader() {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    /**AUTH */

    /* Đăng ký người dùng mới */
    static async registerUser(registration) {
        const response = await axios.post(`${this.BASE_URL}/auth/register`, registration)
        return response.data
    }

    /* Đăng nhập này là người dùng đã đăng ký */
    static async loginUser(loginDetails) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginDetails)
        return response.data
    }

    static async forgotPassword(email) {
        return axios.post(
            `${this.BASE_URL}/auth/forgot-password`,
            { email },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

 static async resetPassword(email, otp, newPassword) {

    return axios.post(
        `${this.BASE_URL}/auth/reset-password`,
        {
            email,
            otp,
            newPassword
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}

    /***USERS */


    /*  Việc này nhằm mục đích lấy thông tin hồ sơ người dùng */
    static async getAllUsers() {
        const response = await axios.get(`${this.BASE_URL}/users/all`, {
            headers: this.getHeader()
        })
        return response.data
    }

    static async getUserProfile() {
        const response = await axios.get(`${this.BASE_URL}/users/get-logged-in-profile-info`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /* Đây là cách để có được một người dùng duy nhất */
    static async getUser(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/get-by-id/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /* Đây là cách để lấy thông tin đặt chỗ của người dùng dựa trên ID người dùng */
    static async getUserBookings(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/get-user-bookings/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }


    /* Thao tác này nhằm xóa người dùng */
    static async deleteUser(userId) {
        const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }

    /**ROOM */
    /* Thao tác này thêm một phòng mới vào cơ sở dữ liệu */
    static async addRoom(formData) {
        const result = await axios.post(`${this.BASE_URL}/rooms/add`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }

    /* Sẽ giúp có được tất cả các phòng còn trống */
    static async getAllAvailableRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all-available-rooms`)
        return result.data
    }


    /* Thao tác này sẽ lấy tất cả các phòng còn trống theo ngày từ cơ sở dữ liệu với ngày và loại phòng đã cho */
    static async getAvailableRoomsByDateAndType(checkInDate, checkOutDate, roomType) {
        const result = await axios.get(
            `${this.BASE_URL}/rooms/available-rooms-by-date-and-type?checkInDate=${checkInDate}
		&checkOutDate=${checkOutDate}&roomType=${roomType}`
        )
        return result.data
    }

    /* Điều này giúp lấy tất cả các loại phòng từ cơ sở dữ liệu */
    static async getRoomTypes() {
        const response = await axios.get(`${this.BASE_URL}/rooms/types`)
        return response.data
    }
    /* Thao tác này lấy tất cả các phòng từ cơ sở dữ liệu */
    static async getAllRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all`)
        return result.data
    }
    /* Chức năng này lấy thông tin phòng dựa trên ID */
    static async getRoomById(roomId) {
        const result = await axios.get(`${this.BASE_URL}/rooms/room-by-id/${roomId}`)
        return result.data
    }

    /* Thao tác này xóa một phòng theo ID */
    static async deleteRoom(roomId) {
        const result = await axios.delete(`${this.BASE_URL}/rooms/delete/${roomId}`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /* Việc này giúp cập nhật một căn phòng*/
    static async updateRoom(roomId, formData) {
        const result = await axios.put(`${this.BASE_URL}/rooms/update/${roomId}`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }


    /**BOOKING */
    /* Thao tác này sẽ lưu một đặt chỗ mới vào cơ sở dữ liệu */
    static async bookRoom(roomId, userId, booking) {

        console.log("USER ID IS: " + userId)

        const response = await axios.post(`${this.BASE_URL}/bookings/book-room/${roomId}/${userId}`, booking, {
            headers: this.getHeader()
        })
        return response.data
    }

    /* Thao tác này lấy tất cả các đặt chỗ từ cơ sở dữ liệu */
    static async getAllBookings() {
        const result = await axios.get(`${this.BASE_URL}/bookings/all`, {
            headers: this.getHeader()
        })
        return result.data
    }

    /* Có thể đặt phòng bằng mã xác nhận */
    static async getBookingByConfirmationCode(bookingCode) {
        const result = await axios.get(`${this.BASE_URL}/bookings/get-by-confirmation-code/${bookingCode}`)
        return result.data
    }

    /* Đây là cách để hủy đặt chỗ của người dùng */
    static async cancelBooking(bookingId) {
        const result = await axios.delete(`${this.BASE_URL}/bookings/cancel/${bookingId}`, {
            headers: this.getHeader()
        })
        return result.data
    }


    /**AUTHENTICATION CHECKER */
    static logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    }

    static isAdmin() {
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }

    static isUser() {
        const role = localStorage.getItem('role')
        return role === 'USER'
    }

    // Lấy danh sách tất cả dịch vụ
    static async getAllServices() {
        const response = await axios.get(`${this.BASE_URL}/services/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    // Lấy thông tin 1 dịch vụ theo ID
    static async getServiceById(serviceId) {
        const response = await axios.get(`${this.BASE_URL}/services/${serviceId}`);
        return response.data;
    }

    // (Dành cho Admin) Thêm dịch vụ mới
    static async addService(serviceData) {
        const response = await axios.post(`${this.BASE_URL}/services/add`, serviceData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    // (Dành cho Admin) Cập nhật dịch vụ
    static async updateService(serviceId, serviceData) {
        const response = await axios.put(`${this.BASE_URL}/services/update/${serviceId}`, serviceData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    // (Dành cho Admin) Xóa dịch vụ
    static async deleteService(serviceId) {
        const response = await axios.delete(`${this.BASE_URL}/services/delete/${serviceId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }
}
// export default new ApiService();
