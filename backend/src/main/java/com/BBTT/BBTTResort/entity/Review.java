package com.BBTT.BBTTResort.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;

    private String name;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String date;
}