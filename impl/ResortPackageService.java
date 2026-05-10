package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.dto.ResortPackageDTO;
import com.BBTT.BBTTResort.entity.ResortPackage;
import com.BBTT.BBTTResort.exception.OurException;
import com.BBTT.BBTTResort.repo.ResortPackageRepository;
import com.BBTT.BBTTResort.service.interfac.IResortPackageService;
import com.BBTT.BBTTResort.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResortPackageService implements IResortPackageService {
    @Autowired private ResortPackageRepository packageRepo;

    @Override
    public Response addNewPackage(String name, String description, BigDecimal price) {
        Response response = new Response();
        try {
            ResortPackage rp = new ResortPackage();
            rp.setName(name);
            rp.setDescription(description);
            rp.setPrice(price);
            packageRepo.save(rp);
            response.setStatusCode(200);
            response.setMessage("Package added successfully.");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllPackages() {
        Response response = new Response();
        try {
            List<ResortPackage> list = packageRepo.findAll();
            List<ResortPackageDTO> dtoList = list.stream().map(Utils::mapResortPackageToDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setResortPackageList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    @Override public Response getPackageById(Long id) { /* Logic tương tự */ return null; }
    @Override public Response updatePackage(Long id, String n, String d, Double p) { /* Logic tương tự */ return null; }
    @Override public Response deletePackage(Long id) {
        Response response = new Response();
        try {
            packageRepo.findById(id).orElseThrow(() -> new OurException("Package not found"));
            packageRepo.deleteById(id);
            response.setStatusCode(200);
        } catch (OurException e) { response.setStatusCode(404); response.setMessage(e.getMessage()); }
        return response;
    }
}