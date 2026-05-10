package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.entity.Payment;
import com.BBTT.BBTTResort.repo.PaymentRepository;
import com.BBTT.BBTTResort.service.interfac.IPaymentService;
import com.BBTT.BBTTResort.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService implements IPaymentService {
    @Autowired private PaymentRepository paymentRepo;

    @Override
    public Response getPaymentByBookingId(Long bookingId) {
        Response response = new Response();
        try {
            Payment payment = paymentRepo.findByBookingId(bookingId); // Giả định Repo có hàm này
            if (payment != null) {
                response.setPayment(Utils.mapPaymentToDTO(payment));
                response.setStatusCode(200);
            }
        } catch (Exception e) { response.setStatusCode(500); }
        return response;
    }

    @Override public Response updatePaymentStatus(Long id, String status) { return null; }
}