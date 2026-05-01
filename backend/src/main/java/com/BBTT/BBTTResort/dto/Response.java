package com.BBTT.BBTTResort.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int statusCode;
    private String message;

    private String token;
    private String role;
    private String expirationTime;
    private String bookingConfirmationCode;

    private UserDTO user;
    private RoomDTO room;
    private BookingDTO booking;
    private List<UserDTO> userList;
    private List<RoomDTO> roomList;
    private List<BookingDTO> bookingList;

    private ResortPackageDTO resortPackage;
    private List<ResortPackageDTO> resortPackageList;

    private ServiceDTO service;
    private List<ServiceDTO> serviceList;

    private PaymentDTO payment;
    private List<PaymentDTO> paymentList;

    private BookingServiceDTO bookingService;
    private List<BookingServiceDTO> bookingServiceList;
}
