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
            if (user.getRole() == null || user.getRole().isBlank()) {
                user.setRole("USER");
            }
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new OurException(user.getEmail() + "Already Exists");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            UserDTO userDTO = Utils.mapUserEntityToUserDTO(savedUser);
            response.setStatusCode(200);
            response.setUser(userDTO);
        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Occurred During USer Registration " + e.getMessage());

        }
        return response;
    }

    @Override
    public Response login(LoginRequest loginRequest) {

        Response response = new Response();

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            var user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new OurException("user Not found"));

            var token = jwtUtils.generateToken(user);
            response.setStatusCode(200);
            response.setToken(token);
            response.setRole(user.getRole());
            response.setExpirationTime("7 Days");
            response.setMessage("successful");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Error Occurred During USer Login " + e.getMessage());
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

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("Email does not exist");
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
            response.setMessage("OTP sent to email");

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response resetPassword(String email, String otp, String newPassword) {

        Response response = new Response();

        try {

            PasswordResetToken token = tokenRepository
                    .findByEmailAndOtp(email, otp)
                    .orElse(null);

            if (token == null) {
                response.setStatusCode(400);
                response.setMessage("Invalid OTP");
                return response;
            }

            if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
                response.setStatusCode(400);
                response.setMessage("OTP expired");
                return response;
            }

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                response.setStatusCode(404);
                response.setMessage("User not found");
                return response;
            }

            user.setPassword(passwordEncoder.encode(newPassword));

            userRepository.save(user);

            tokenRepository.deleteByEmail(email);

            response.setStatusCode(200);
            response.setMessage("Password reset successful");

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatusCode(500);
            response.setMessage(e.getMessage());
        }

        return response;
    }
}
