package com.BBTT.BBTTResort.dto;

import lombok.Data;

@Data
public class VNPayResponse {
    private String status;       // "OK" hoặc "FAILED"
    private String message;
    private String paymentUrl;   // URL redirect sang VNPAY
    private String bookingConfirmationCode;
}