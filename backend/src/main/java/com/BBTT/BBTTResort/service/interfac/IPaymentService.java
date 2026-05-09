package com.BBTT.BBTTResort.service.interfac;
import com.BBTT.BBTTResort.dto.Response;

public interface IPaymentService {
    Response getPaymentByBookingId(Long bookingId);
    Response updatePaymentStatus(Long paymentId, String status);
}