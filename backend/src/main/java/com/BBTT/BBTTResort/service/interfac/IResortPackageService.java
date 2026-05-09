package com.BBTT.BBTTResort.service.interfac;
import com.BBTT.BBTTResort.dto.Response;

import java.math.BigDecimal;

public interface IResortPackageService {
    Response addNewPackage(String name, String description, BigDecimal price);
    Response getAllPackages();
    Response getPackageById(Long packageId);
    Response updatePackage(Long packageId, String name, String description, Double price);
    Response deletePackage(Long packageId);
}