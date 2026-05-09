package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.service.interfac.IServiceManagement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/services")
public class ServiceController {

    @Autowired
    private IServiceManagement serviceManagement;

    // Lấy danh sách dịch vụ
    @GetMapping("/all")
    public ResponseEntity<Response> getAllServices() {
        Response response = serviceManagement.getAllServices();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Thêm dịch vụ mới
    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addNewService(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price) {

        Response response = serviceManagement.addNewService(name, price, description);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    // Xóa dịch vụ
    @DeleteMapping("/delete/{serviceId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteService(@PathVariable("serviceId") Long serviceId) {
        Response response = serviceManagement.deleteService(serviceId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}