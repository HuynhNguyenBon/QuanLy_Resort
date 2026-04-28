package com.BBTT.BBTTResort.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ResortPackageDTO {

    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
}
