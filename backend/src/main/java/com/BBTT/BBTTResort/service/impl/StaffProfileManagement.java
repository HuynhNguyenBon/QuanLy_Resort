package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.dto.StaffProfileDTO;
import com.BBTT.BBTTResort.entity.StaffProfile;
import com.BBTT.BBTTResort.entity.User;
import com.BBTT.BBTTResort.repo.StaffProfileRepository;
import com.BBTT.BBTTResort.repo.UserRepository;
import com.BBTT.BBTTResort.service.interfac.IStaffProfileManagement;
import com.BBTT.BBTTResort.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class StaffProfileManagement implements IStaffProfileManagement {

    @Autowired private StaffProfileRepository staffProfileRepo;
    @Autowired private UserRepository userRepo;

    @Override
    public Response getAllStaffProfiles() {
        Response response = new Response();
        try {
            List<StaffProfile> list = staffProfileRepo.findAll();
            List<StaffProfileDTO> dtoList = list.stream().map(Utils::mapStaffProfileToDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setStaffProfileList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching staff profiles: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response addStaffProfile(String name, String email, String phoneNumber, String role, String startDate, String note, boolean hasAccount) {
        Response response = new Response();
        try {
            StaffProfile profile = new StaffProfile();
            profile.setName(name);
            profile.setEmail(email);
            profile.setPhoneNumber(phoneNumber);
            profile.setRole(role);
            profile.setStartDate(startDate);
            profile.setNote(note);
            profile.setHasAccount(hasAccount);

            if (email != null && !email.isBlank()) {
                User user = userRepo.findByEmail(email).orElse(null);
                if (user != null) {
                    profile.setUser(user);
                    profile.setHasAccount(true);
                }
            }

            staffProfileRepo.save(profile);
            response.setStatusCode(200);
            response.setMessage("Staff profile added successfully!");
            response.setStaffProfile(Utils.mapStaffProfileToDTO(profile));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Staff profile save error: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response updateStaffProfile(Long id, String name, String email, String phoneNumber, String role, String startDate, String note) {
        Response response = new Response();
        try {
            StaffProfile profile = staffProfileRepo.findById(id).orElse(null);
            if (profile == null) {
                response.setStatusCode(404);
                response.setMessage("Staff profile not found with ID: " + id);
                return response;
            }
            profile.setName(name);
            profile.setEmail(email);
            profile.setPhoneNumber(phoneNumber);
            profile.setRole(role);
            profile.setStartDate(startDate);
            profile.setNote(note);

            if (email != null && !email.isBlank()) {
                User user = userRepo.findByEmail(email).orElse(null);
                if (user != null) {
                    profile.setUser(user);
                    profile.setHasAccount(true);
                }
            }

            staffProfileRepo.save(profile);
            response.setStatusCode(200);
            response.setMessage("Staff profile updated successfully!");
            response.setStaffProfile(Utils.mapStaffProfileToDTO(profile));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Staff profile update error: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteStaffProfile(Long id) {
        Response response = new Response();
        try {
            if (staffProfileRepo.existsById(id)) {
                staffProfileRepo.deleteById(id);
                response.setStatusCode(200);
                response.setMessage("Staff profile successfully removed!");
            } else {
                response.setStatusCode(404);
                response.setMessage("No staff profile found with ID: " + id);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error when deleting staff profile: " + e.getMessage());
        }
        return response;
    }
}