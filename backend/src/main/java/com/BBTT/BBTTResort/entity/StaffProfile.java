package com.BBTT.BBTTResort.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "staff_profiles")
public class StaffProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String name;

    private String email;

    private String phoneNumber;

    private String role;

    private String startDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    private boolean hasAccount;
}