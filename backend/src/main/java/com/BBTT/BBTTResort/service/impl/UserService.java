package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.dto.LoginRequest;
import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.dto.UserDTO;
import com.BBTT.BBTTResort.entity.User;
import com.BBTT.BBTTResort.exception.OurException;
import com.BBTT.BBTTResort.repo.UserRepository;
import com.BBTT.BBTTResort.service.interfac.IUserService;
import com.BBTT.BBTTResort.utils.JWTUtils;
import com.BBTT.BBTTResort.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.BBTT.BBTTResort.entity.PasswordResetToken;
import com.BBTT.BBTTResort.repo.PasswordResetTokenRepository;
import com.BBTT.BBTTResort.service.EmailService;
import java.time.LocalDateTime;
import java.util.Random;

import java.util.List;

@Service
public class UserService implements IUserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JWTUtils jwtUtils;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;


    @Override
    public Response register(User user) {

        Response response = new Response();

        try {

            if (user.getName() == null || user.getName().trim().isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vui lòng nhập họ tên");
                return response;
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vui lòng nhập email");
                return response;
            }

            String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

            if (!user.getEmail().matches(emailRegex)) {
                response.setStatusCode(400);
                response.setMessage("Email không đúng định dạng");
                return response;
            }

            if (userRepository.existsByEmail(user.getEmail())) {
                response.setStatusCode(400);
                response.setMessage("Email đã tồn tại");
                return response;
            }

            if (user.getPhoneNumber() == null ||
                    !user.getPhoneNumber().matches("^[0-9]{10,11}$")) {

                response.setStatusCode(400);
                response.setMessage("Số điện thoại phải từ 10 đến 11 số");
                return response;
            }

            if (user.getPassword() == null || user.getPassword().length() < 6) {
                response.setStatusCode(400);
                response.setMessage("Mật khẩu phải có ít nhất 6 ký tự");
                return response;
            }

            if (user.getRole() == null || user.getRole().isBlank()) {
                user.setRole("USER");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));

            User savedUser = userRepository.save(user);

            UserDTO userDTO = Utils.mapUserEntityToUserDTO(savedUser);

            response.setStatusCode(200);
            response.setMessage("Đăng ký thành công");
            response.setUser(userDTO);

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Lỗi đăng ký: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response login(LoginRequest loginRequest) {

        Response response = new Response();

        try {

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElse(null);

            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("Email không tồn tại");
                return response;
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            var token = jwtUtils.generateToken(user);

            response.setStatusCode(200);
            response.setToken(token);
            response.setRole(user.getRole());
            response.setExpirationTime("7 Days");
            response.setMessage("Đăng nhập thành công");

        } catch (Exception e) {

            response.setStatusCode(401);
            response.setMessage("Mật khẩu không chính xác");
        }

        return response;
    }


    @Override
    public Response getAllUsers() {

        Response response = new Response();
        try {
            List<User> userList = userRepository.findAll();
            List<UserDTO> userDTOList = Utils.mapUserListEntityToUserListDTO(userList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUserList(userDTOList);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getUserBookingHistory(String userId) {

        Response response = new Response();


        try {
            User user = userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new OurException("User Not Found"));
            UserDTO userDTO = Utils.mapUserEntityToUserDTOPlusUserBookingsAndRoom(user);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUser(userDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteUser(String userId) {

        Response response = new Response();

        try {
            userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new OurException("User Not Found"));
            userRepository.deleteById(Long.valueOf(userId));
            response.setStatusCode(200);
            response.setMessage("successful");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getUserById(String userId) {

        Response response = new Response();

        try {
            User user = userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new OurException("User Not Found"));
            UserDTO userDTO = Utils.mapUserEntityToUserDTO(user);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUser(userDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getMyInfo(String email) {

        Response response = new Response();

        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new OurException("User Not Found"));
            UserDTO userDTO = Utils.mapUserEntityToUserDTO(user);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUser(userDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Error getting all users " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response forgotPassword(String email) {

        Response response = new Response();

        try {

            if (email == null || email.trim().isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vui lòng nhập email");
                return response;
            }

            String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

            if (!email.matches(emailRegex)) {
                response.setStatusCode(400);
                response.setMessage("Email không đúng định dạng");
                return response;
            }

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("Email không tồn tại");
                return response;
            }

            String otp = String.valueOf(100000 + new Random().nextInt(900000));

            PasswordResetToken token = new PasswordResetToken();
            token.setEmail(email);
            token.setOtp(otp);
            token.setExpiryTime(LocalDateTime.now().plusMinutes(5));

            tokenRepository.deleteByEmail(email);
            tokenRepository.save(token);

            emailService.sendOtpEmail(email, otp);

            response.setStatusCode(200);
            response.setMessage("Mã OTP đã được gửi đến email của bạn");

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Lỗi gửi OTP: " + e.getMessage());
        }

        return response;
    }


    @Override
    public Response updateMyProfile(String userId, String email, String name, String phoneNumber) {
        Response response = new Response();
        try {
            User user = null;
            if (userId != null && !userId.trim().isEmpty()) {
                user = userRepository.findById(Long.parseLong(userId)).orElse(null);
            }
            if (user == null && email != null && !email.trim().isEmpty()) {
                user = userRepository.findByEmail(email).orElse(null);
            }
            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("Không tìm thấy người dùng");
                return response;
            }
            if (name != null && !name.trim().isEmpty()) {
                user.setName(name.trim());
            }
            if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
                user.setPhoneNumber(phoneNumber.trim());
            }
            userRepository.save(user);
            response.setStatusCode(200);
            response.setMessage("Cập nhật thông tin thành công");
            response.setUser(Utils.mapUserEntityToUserDTO(user));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Lỗi cập nhật: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response updateMyProfile(String userId, String email, String name, String phoneNumber) {
        Response response = new Response();
        try {
            User user = null;
            if (userId != null && !userId.trim().isEmpty()) {
                user = userRepository.findById(Long.parseLong(userId)).orElse(null);
            }
            if (user == null && email != null && !email.trim().isEmpty()) {
                user = userRepository.findByEmail(email).orElse(null);
            }
            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("Không tìm thấy người dùng");
                return response;
            }
            if (name != null && !name.trim().isEmpty()) {
                user.setName(name.trim());
            }
            if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
                user.setPhoneNumber(phoneNumber.trim());
            }
            userRepository.save(user);
            response.setStatusCode(200);
            response.setMessage("Cập nhật thông tin thành công");
            response.setUser(Utils.mapUserEntityToUserDTO(user));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Lỗi cập nhật: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response resetPassword(String email, String otp, String newPassword) {

        Response response = new Response();

        try {

            if (email == null || email.trim().isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vui lòng nhập email");
                return response;
            }

            if (otp == null || otp.trim().isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vui lòng nhập mã OTP");
                return response;
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.setStatusCode(400);
                response.setMessage("Vui lòng nhập mật khẩu mới");
                return response;
            }

            PasswordResetToken token = tokenRepository
                    .findByEmailAndOtp(email, otp)
                    .orElse(null);

            if (token == null) {
                response.setStatusCode(400);
                response.setMessage("Mã OTP không chính xác hoặc email không khớp");
                return response;
            }

            if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
                response.setStatusCode(400);
                response.setMessage("Mã OTP đã hết hạn");
                return response;
            }

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("Người dùng không tồn tại");
                return response;
            }

            user.setPassword(passwordEncoder.encode(newPassword));

            userRepository.save(user);

            tokenRepository.deleteByEmail(email);

            response.setStatusCode(200);
            response.setMessage("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại");

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Lỗi reset mật khẩu: " + e.getMessage());
        }

        return response;
    }

}
