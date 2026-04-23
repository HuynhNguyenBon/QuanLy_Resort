package com.BBTT.BBTTResort.service.interfac;
import com.BBTT.BBTTResort.dto.Response;

import java.math.BigDecimal;

public interface IServiceManagement {
    Response addNewService(String name, BigDecimal price, String description);
    Response getAllServices();
    Response deleteService(Long serviceId);
}