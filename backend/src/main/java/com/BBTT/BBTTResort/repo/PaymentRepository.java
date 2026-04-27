package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Custom query để tìm thanh toán theo Booking
    Payment findByBookingId(Long bookingId);
}