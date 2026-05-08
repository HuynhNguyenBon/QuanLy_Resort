package com.BBTT.BBTTResort.service.interfac;

import com.BBTT.BBTTResort.dto.LoginRequest;
import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.entity.User;

public interface IUserService {
    Response register(User user);

    Response login(LoginRequest loginRequest);

    Response getAllUsers();

    Response getUserBookingHistory(String userId);

    Response deleteUser(String userId);

    Response getUserById(String userId);

    Response getMyInfo(String email);

    Response forgotPassword(String email);

    Response resetPassword(String email, String otp, String newPassword);
}
