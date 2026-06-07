package com.BBTT.BBTTResort.dto;

import lombok.Data;

@Data
public class StaffProfileDTO {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
    private String startDate;
    private String note;
    private boolean hasAccount;
}