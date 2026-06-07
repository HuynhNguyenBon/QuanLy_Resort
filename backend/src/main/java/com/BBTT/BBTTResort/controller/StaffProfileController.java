package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.service.interfac.IStaffProfileManagement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staff-profiles")
@PreAuthorize("hasAuthority('ADMIN')")
public class StaffProfileController {

    @Autowired
    private IStaffProfileManagement staffProfileManagement;

    @GetMapping("/all")
    public ResponseEntity<Response> getAllStaffProfiles() {
        Response response = staffProfileManagement.getAllStaffProfiles();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/add")
    public ResponseEntity<Response> addStaffProfile(
            @RequestParam("name") String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam(value = "hasAccount", required = false, defaultValue = "false") boolean hasAccount) {
        Response response = staffProfileManagement.addStaffProfile(name, email, phoneNumber, role, startDate, note, hasAccount);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Response> updateStaffProfile(
            @PathVariable("id") Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "note", required = false) String note) {
        Response response = staffProfileManagement.updateStaffProfile(id, name, email, phoneNumber, role, startDate, note);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Response> deleteStaffProfile(@PathVariable("id") Long id) {
        Response response = staffProfileManagement.deleteStaffProfile(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}