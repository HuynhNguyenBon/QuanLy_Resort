package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.dto.ServiceDTO;
import com.BBTT.BBTTResort.entity.Service;
import com.BBTT.BBTTResort.repo.ServiceRepository;
import com.BBTT.BBTTResort.service.interfac.IServiceManagement;
import com.BBTT.BBTTResort.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceManagement implements IServiceManagement {
    @Autowired private ServiceRepository serviceRepo;
    @Autowired private ServiceRepository serviceRepository;

    @Override
    public Response getAllServices() {
        Response response = new Response();
        try {
            List<Service> list = serviceRepo.findAll();
            List<ServiceDTO> dtoList = list.stream().map(Utils::mapServiceToDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setServiceList(dtoList);
        } catch (Exception e) { response.setStatusCode(500); }
        return response;
    }
    // Các hàm add/delete
    @Override public Response addNewService(String n, BigDecimal p, String d) {
        Response response = new Response();
        try {
            response.setStatusCode(200);
            response.setMessage("Service added successfully!");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Service save error: " + e.getMessage());
        }
        return response;
    }
    @Override public Response deleteService(Long serviceId) {
        Response response = new Response();
        try {
            // Kiểm tra xem dịch vụ có tồn tại không trước khi xóa
            if (serviceRepository.existsById(serviceId)) {
                serviceRepository.deleteById(serviceId);
                response.setStatusCode(200);
                response.setMessage("Service successfully removed!");
            } else {
                response.setStatusCode(404);
                response.setMessage("No service found with ID: " + serviceId);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error when deleting service: " + e.getMessage());
        }
        return response;
    }
}