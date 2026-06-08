package com.BBTT.BBTTResort.dto;

import lombok.Data;

@Data
public class ReviewDTO {

    private Long id;
    private Long roomId;
    private String name;
    private Integer rating;
    private String comment;
    private String date;
}