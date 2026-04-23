package com.BBTT.BBTTResort.service.interfac;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.entity.Booking;

public interface IBookingService {

    Response saveBooking(Long roomId, Long userId, Booking bookingRequest);

    Response findBookingByConfirmationCode(String confirmationCode);

    Response getAllBookings();

    Response cancelBooking(Long bookingId);

    Response getBookingServicesByBookingId(Long bookingId);

}
