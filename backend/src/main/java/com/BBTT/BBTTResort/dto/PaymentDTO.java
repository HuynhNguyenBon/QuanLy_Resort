package com.BBTT.BBTTResort.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentDTO {

    private Long id;
    private Long bookingId; // Chỉ trả về ID của booking để tránh đệ quy
    private BigDecimal amount;
    private String method;
    private String status;
}
