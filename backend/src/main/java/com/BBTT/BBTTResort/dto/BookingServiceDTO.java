package com.BBTT.BBTTResort.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookingServiceDTO {

    private Long id;
    private ServiceDTO service;
    private int quantity;
    private BigDecimal totalPrice;
    private Double amount;
}
