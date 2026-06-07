package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.entity.Booking;
import com.BBTT.BBTTResort.service.interfac.IBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import com.BBTT.BBTTResort.repo.BookingRepository;
import com.BBTT.BBTTResort.service.EmailService;

@RestController
@RequestMapping("/bookings")

public class BookingController {

    @Autowired
    private IBookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/book-room/{roomId}/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> saveBookings(@PathVariable Long roomId,
                                                 @PathVariable Long userId,
                                                 @RequestBody Booking bookingRequest) {


        Response response = bookingService.saveBooking(roomId, userId, bookingRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);

    }
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF')")
    public ResponseEntity<Response> getAllBookings() {
        Response response = bookingService.getAllBookings();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-by-confirmation-code/{confirmationCode}")
    public ResponseEntity<Response> getBookingByConfirmationCode(@PathVariable String confirmationCode) {
        Response response = bookingService.findBookingByConfirmationCode(confirmationCode);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/cancel/{bookingId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> cancelBooking(@PathVariable Long bookingId) {
        Response response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Lấy danh sách dịch vụ khách đã gọi thêm theo mã đặt phòng
    @GetMapping("/booking-services/{bookingId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> getBookingServices(@PathVariable Long bookingId) {
        // Giả sử đã thêm hàm getBookingServicesByBookingId vào IBookingService
        Response response = bookingService.getBookingServicesByBookingId(bookingId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> getBookingsByUserId(
            @PathVariable Long userId
    ) {

        Response response = bookingService.getBookingsByUserId(userId);

        return ResponseEntity.status(response.getStatusCode())
                .body(response);
    }

    @PutMapping("/update/{bookingId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER') or hasAuthority('STAFF')")
    public ResponseEntity<Response> updateBooking(
            @PathVariable Long bookingId,
            @RequestBody Booking updateRequest) {
        Response response = bookingService.updateBooking(bookingId, updateRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/send-confirmation-email/{bookingId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> sendConfirmationEmail(@PathVariable Long bookingId) {
        Response response = new Response();
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
            emailService.sendBookingConfirmationEmail(
                    booking.getUser().getEmail(),
                    booking.getUser().getName(),
                    booking.getBookingConfirmationCode(),
                    booking.getRoom() != null ? booking.getRoom().getRoomType() : "N/A",
                    booking.getCheckInDate().toString(),
                    booking.getCheckOutDate().toString(),
                    booking.getTotalNumOfGuest(),
                    booking.getNumOfAdults(),
                    booking.getNumOfChildren(),
                    booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0
            );
            response.setStatusCode(200);
            response.setMessage("Email đã gửi thành công");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Lỗi gửi email: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam Long roomId,
            @RequestParam String checkInDate,
            @RequestParam String checkOutDate
    ) {

        boolean isBooked = bookingRepository.existsOverlappingBooking(
                roomId,
                LocalDate.parse(checkInDate),
                LocalDate.parse(checkOutDate)
        );

        return ResponseEntity.ok(!isBooked);
    }
}
