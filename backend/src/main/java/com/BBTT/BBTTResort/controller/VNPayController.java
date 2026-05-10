package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.dto.VNPayRequest;
import com.BBTT.BBTTResort.dto.VNPayResponse;
import com.BBTT.BBTTResort.service.impl.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    /**
     * Tạo URL thanh toán
     * POST /payment/create
     */
    @PostMapping("/create")
    public ResponseEntity<VNPayResponse> createPayment(
            @RequestBody VNPayRequest request,
            HttpServletRequest httpRequest) {

        // Lấy IP của client
        String ipAddress = httpRequest.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        request.setIpAddress(ipAddress);

        VNPayResponse response = vnPayService.createPaymentUrl(request);
        return ResponseEntity.ok(response);
    }

    /**
     * IPN - VNPAY gọi ngầm để xác nhận giao dịch
     * GET /payment/vnpay-ipn
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<String> handleIPN(
            @RequestParam Map<String, String> params) {
        String result = vnPayService.handleIPN(params);
        return ResponseEntity.ok(result);
    }

    /**
     * Return URL - Redirect user về sau khi thanh toán
     * GET /payment/vnpay-return
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, String>> handleReturn(
            @RequestParam Map<String, String> params) {
        Map<String, String> result = vnPayService.handleReturn(params);
        return ResponseEntity.ok(result);
    }
}