package com.BBTT.BBTTResort.utils;

import com.BBTT.BBTTResort.dto.*;
import com.BBTT.BBTTResort.entity.*;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

public class Utils {

    private static final String ALPHANUMERIC_STRING =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final SecureRandom secureRandom = new SecureRandom();

    // ===================== RANDOM CODE =====================
    public static String generateRandomConfirmationCode(int length) {
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < length; i++) {
            int index = secureRandom.nextInt(ALPHANUMERIC_STRING.length());
            sb.append(ALPHANUMERIC_STRING.charAt(index));
        }

        return sb.toString();
    }

    // ===================== USER =====================
    public static UserDTO mapUserEntityToUserDTO(User user) {
        UserDTO dto = new UserDTO();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());

        return dto;
    }

    // ===================== ROOM (MULTI LANGUAGE) =====================
    public static RoomDTO mapRoomEntityToRoomDTO(Room room) {

        RoomDTO dto = new RoomDTO();

        dto.setId(room.getId());
        dto.setRoomPrice(room.getRoomPrice());
        dto.setRoomPhotoUrl(room.getRoomPhotoUrl());

        dto.setRoomTypeVi(room.getRoomTypeVi());
        dto.setRoomTypeEn(room.getRoomTypeEn());
        dto.setRoomTypeJp(room.getRoomTypeJp());

        dto.setRoomDescriptionVi(room.getRoomDescriptionVi());
        dto.setRoomDescriptionEn(room.getRoomDescriptionEn());
        dto.setRoomDescriptionJp(room.getRoomDescriptionJp());

        return dto;
    }

    // ===================== ROOM + BOOKINGS =====================
    public static RoomDTO mapRoomEntityToRoomDTOPlusBookings(Room room, String lang) {

        RoomDTO dto = mapRoomEntityToRoomDTO(room);

        if (room.getBookings() != null) {
            dto.setBookings(
                    room.getBookings()
                            .stream()
                            .map(Utils::mapBookingEntityToBookingDTO)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // ===================== ROOM LIST =====================
    public static List<RoomDTO> mapRoomListEntityToRoomListDTO(List<Room> rooms, String lang) {
        return rooms.stream()
                .map(room -> mapRoomEntityToRoomDTO(room))
                .collect(Collectors.toList());
    }

    // ===================== BOOKING =====================
    public static BookingDTO mapBookingEntityToBookingDTO(Booking booking) {

        BookingDTO dto = new BookingDTO();

        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumOfAdults(booking.getNumOfAdults());
        dto.setNumOfChildren(booking.getNumOfChildren());
        dto.setTotalNumOfGuest(booking.getTotalNumOfGuest());
        dto.setBookingConfirmationCode(booking.getBookingConfirmationCode());

        return dto;
    }

    // ===================== BOOKING + ROOM =====================
    public static BookingDTO mapBookingEntityToBookingDTOPlusBookedRooms(
            Booking booking,
            boolean mapUser,
            String lang
    ) {

        BookingDTO dto = new BookingDTO();

        dto.setId(booking.getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumOfAdults(booking.getNumOfAdults());
        dto.setNumOfChildren(booking.getNumOfChildren());
        dto.setTotalNumOfGuest(booking.getTotalNumOfGuest());
        dto.setBookingConfirmationCode(booking.getBookingConfirmationCode());

        if (mapUser) {
            dto.setUser(mapUserEntityToUserDTO(booking.getUser()));
        }

        if (booking.getRoom() != null) {
            dto.setRoom(
                    mapRoomEntityToRoomDTO(booking.getRoom())
            );
        }

        return dto;
    }

    // ===================== USER + BOOKINGS =====================
    public static UserDTO mapUserEntityToUserDTOPlusUserBookingsAndRoom(User user, String lang) {

        UserDTO dto = mapUserEntityToUserDTO(user);

        if (user.getBookings() != null && !user.getBookings().isEmpty()) {
            dto.setBookings(
                    user.getBookings()
                            .stream()
                            .map(b -> mapBookingEntityToBookingDTOPlusBookedRooms(b, false, lang))
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // ===================== RESORT PACKAGE =====================
    public static ResortPackageDTO mapResortPackageToDTO(ResortPackage entity) {
        ResortPackageDTO dto = new ResortPackageDTO();

        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPrice(entity.getPrice());
        dto.setDescription(entity.getDescription());

        return dto;
    }

    // ===================== SERVICE =====================
    public static ServiceDTO mapServiceToDTO(Service entity) {
        ServiceDTO dto = new ServiceDTO();

        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPrice(entity.getPrice());
        dto.setDescription(entity.getDescription());

        return dto;
    }

    // ===================== PAYMENT =====================
    public static PaymentDTO mapPaymentToDTO(Payment entity) {
        PaymentDTO dto = new PaymentDTO();

        dto.setId(entity.getId());
        dto.setAmount(entity.getAmount());
        dto.setMethod(entity.getMethod());
        dto.setStatus(entity.getStatus());

        return dto;
    }

    // ===================== BOOKING SERVICE =====================
    public static BookingServiceDTO mapBookingServiceToDTO(BookingService entity) {

        BookingServiceDTO dto = new BookingServiceDTO();

        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setAmount(entity.getAmount().doubleValue());
        dto.setTotalPrice(entity.getTotalPrice());

        if (entity.getService() != null) {
            dto.setService(mapServiceToDTO(entity.getService()));
        }

        return dto;
    }

    // ===================== LIST MAPPERS =====================
    public static List<UserDTO> mapUserListEntityToUserListDTO(List<User> list) {
        return list.stream()
                .map(Utils::mapUserEntityToUserDTO)
                .collect(Collectors.toList());
    }

    public static List<BookingDTO> mapBookingListEntityToBookingListDTO(List<Booking> list) {
        return list.stream()
                .map(Utils::mapBookingEntityToBookingDTO)
                .collect(Collectors.toList());
    }
}