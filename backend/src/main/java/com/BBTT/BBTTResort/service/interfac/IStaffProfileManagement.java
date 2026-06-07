package com.BBTT.BBTTResort.service.interfac;

import com.BBTT.BBTTResort.dto.Response;

public interface IStaffProfileManagement {
    Response getAllStaffProfiles();
    Response addStaffProfile(String name, String email, String phoneNumber, String role, String startDate, String note, boolean hasAccount);
    Response updateStaffProfile(Long id, String name, String email, String phoneNumber, String role, String startDate, String note);
    Response deleteStaffProfile(Long id);
}