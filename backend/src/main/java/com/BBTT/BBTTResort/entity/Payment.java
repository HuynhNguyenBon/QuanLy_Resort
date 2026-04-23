package com.BBTT.BBTTResort.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sơ đồ ghi 0..1, nghĩa là quan hệ 1-1 giữa Booking và Payment
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    private BigDecimal amount;

    private String method;

    private String status;
}
