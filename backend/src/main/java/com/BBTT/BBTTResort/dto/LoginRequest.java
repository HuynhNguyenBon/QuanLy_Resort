package com.BBTT.BBTTResort.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is requỉred")
    private String email;
    @NotBlank(message = "Password is requỉred")
    private String password;
}
