package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.service.interfac.IResortPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/packages")
public class ResortPackageController {

    @Autowired
    private IResortPackageService packageService;

    // Lấy danh sách tất cả các gói (Ai cũng xem được)
    @GetMapping("/all")
    public ResponseEntity<Response> getAllPackages() {
        Response response = packageService.getAllPackages();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Thêm gói mới (Chỉ Admin)
    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addNewPackage(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price) {

        Response response = packageService.addNewPackage(name, description, price);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Xóa gói (Chỉ Admin)
    @DeleteMapping("/delete/{packageId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deletePackage(@PathVariable Long packageId) {
        Response response = packageService.deletePackage(packageId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}