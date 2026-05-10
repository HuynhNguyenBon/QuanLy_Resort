package com.BBTT.BBTTResort.dto;

import lombok.Data;

@Data
public class VNPayRequest {
    private Long bookingId;
    private String orderInfo;    // Mô tả đơn hàng
    private String ipAddress;    // IP của client
}