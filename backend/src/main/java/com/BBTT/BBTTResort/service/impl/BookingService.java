package com.BBTT.BBTTResort.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import com.BBTT.BBTTResort.dto.BookingDTO;
import com.BBTT.BBTTResort.dto.BookingServiceDTO;
import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.entity.Booking;
import com.BBTT.BBTTResort.entity.Room;
import com.BBTT.BBTTResort.entity.User;
import com.BBTT.BBTTResort.exception.OurException;
import com.BBTT.BBTTResort.repo.BookingRepository;
import com.BBTT.BBTTResort.repo.BookingServiceRepository;
import com.BBTT.BBTTResort.repo.RoomRepository;
import com.BBTT.BBTTResort.repo.UserRepository;
import com.BBTT.BBTTResort.service.interfac.IBookingService;
import com.BBTT.BBTTResort.service.interfac.IRoomService;
import com.BBTT.BBTTResort.utils.Utils;
import com.BBTT.BBTTResort.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService implements IBookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingServiceRepository bookingServiceRepository;
    @Autowired
    private IRoomService roomService;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public Response saveBooking(Long roomId, Long userId, Booking bookingRequest) {

        Response response = new Response();

        try {

            if (bookingRequest.getCheckInDate() == null || bookingRequest.getCheckOutDate() == null) {
                throw new OurException("Check in/check out date is required");
            }

            if (bookingRequest.getCheckInDate().isBefore(LocalDate.now())) {
                throw new OurException("Check in date cannot be in the past");
            }

            if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
                throw new OurException("Check out date must be after check in date");
            }

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new OurException("User Not Found"));


            boolean isBooked = bookingRepository.existsOverlappingBooking(
                    roomId,
                    bookingRequest.getCheckInDate(),
                    bookingRequest.getCheckOutDate()
            );

            if (isBooked) {
                throw new OurException("Room already booked for selected dates");
            }


            long totalDays = ChronoUnit.DAYS.between(
                    bookingRequest.getCheckInDate(),
                    bookingRequest.getCheckOutDate()
            );

            double basePrice = room.getRoomPrice().doubleValue() * totalDays;
            double discountAmount = 0;
            if (bookingRequest.getDiscountPercent() != null && bookingRequest.getDiscountPercent() > 0) {
                discountAmount = basePrice * bookingRequest.getDiscountPercent() / 100.0;
            }
            double totalPrice = basePrice - discountAmount;

            bookingRequest.setRoom(room);
            bookingRequest.setUser(user);
            bookingRequest.setDiscountAmount(discountAmount);
            bookingRequest.setTotalPrice(totalPrice);
            bookingRequest.setBookingStatus("BOOKED");
            bookingRequest.setCreatedAt(LocalDate.now());

            String bookingCode = Utils.generateRandomConfirmationCode(10);

            bookingRequest.setBookingConfirmationCode(bookingCode);

            bookingRepository.save(bookingRequest);

            // Gửi email xác nhận sau khi đặt phòng thành công
            try {
                emailService.sendBookingConfirmationEmail(
                        user.getEmail(),
                        user.getName(),
                        bookingCode,
                        room.getRoomType(),
                        bookingRequest.getCheckInDate().toString(),
                        bookingRequest.getCheckOutDate().toString(),
                        bookingRequest.getTotalNumOfGuest(),
                        bookingRequest.getNumOfAdults(),
                        bookingRequest.getNumOfChildren(),
                        totalPrice
                );
            } catch (Exception emailEx) {
                System.err.println("Lỗi gửi email: " + emailEx.getMessage());
            }

            response.setStatusCode(200);
            response.setMessage("Booking created successfully");
            response.setBookingConfirmationCode(bookingCode);

            response.setBookingId(bookingRequest.getId());

        } catch (OurException e) {

            response.setStatusCode(400);
            response.setMessage(e.getMessage());
            if (bookingRequest.getCheckOutDate().isBefore(bookingRequest.getCheckInDate())) {
                throw new IllegalArgumentException("Check in date must come after check out date");
            }
            Room room = roomRepository.findById(roomId).orElseThrow(() -> new OurException("Room Not Found"));
            User user = userRepository.findById(userId).orElseThrow(() -> new OurException("User Not Found"));

            List<Booking> existingBookings = room.getBookings();

            if (!roomIsAvailable(bookingRequest, existingBookings)) {
                throw new OurException("Room not Available for selected date range");
            }

            bookingRequest.setRoom(room);
            bookingRequest.setUser(user);
            String bookingConfirmationCode = Utils.generateRandomConfirmationCode(10);
            bookingRequest.setBookingConfirmationCode(bookingConfirmationCode);
            bookingRepository.save(bookingRequest);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingConfirmationCode(bookingConfirmationCode);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Saving a booking: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getBookingServicesByBookingId(Long bookingId) {
        Response response = new Response();
        try {
            // Giả sử BookingServiceRepository của bạn đã có hàm findByBookingId
            List<BookingServiceDTO> dtoList = bookingServiceRepository.findByBookingId(bookingId)
                    .stream()
                    .map(Utils::mapBookingServiceToDTO)
                    .collect(Collectors.toList());

            response.setBookingServiceList(dtoList);
            response.setStatusCode(200);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving service list: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response findBookingByConfirmationCode(String confirmationCode) {

        Response response = new Response();

        try {
            Booking booking = bookingRepository.findByBookingConfirmationCode(confirmationCode).orElseThrow(() -> new OurException("Booking Not Found"));
            BookingDTO bookingDTO = Utils.mapBookingEntityToBookingDTOPlusBookedRooms(booking, true);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBooking(bookingDTO);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Finding a booking: " + e.getMessage());

        }
        return response;
    }

    @Override
    public Response getAllBookings() {

        Response response = new Response();

        try {
            List<Booking> bookingList = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
            List<BookingDTO> bookingDTOList = Utils.mapBookingListEntityToBookingListDTO(bookingList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingList(bookingDTOList);

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Getting all bookings: " + e.getMessage());

        }
        return response;
    }

    @Override
    public Response getBookingsByUserId(Long userId) {

        Response response = new Response();

        try {

            List<Booking> bookingList = bookingRepository.findByUserId(userId);

            List<BookingDTO> bookingDTOList =
                    Utils.mapBookingListEntityToBookingListDTO(bookingList);

            response.setStatusCode(200);
            response.setMessage("success");
            response.setBookingList(bookingDTOList);

        } catch (Exception e) {

            response.setStatusCode(500);
            response.setMessage(e.getMessage());
        }

        return response;
    }

    @Override
    public Response cancelBooking(Long bookingId) {

        Response response = new Response();

        try {
            bookingRepository.findById(bookingId).orElseThrow(() -> new OurException("Booking Does Not Exist"));
            bookingRepository.deleteById(bookingId);
            response.setStatusCode(200);
            response.setMessage("successful");

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Cancelling a booking: " + e.getMessage());

        }
        return response;
    }
    @Override
    public Response updateBooking(Long bookingId, Booking updateRequest) {
        Response response = new Response();
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new OurException("Booking not found"));

            boolean datesChanged = false;
            if (updateRequest.getCheckInDate() != null) {
                booking.setCheckInDate(updateRequest.getCheckInDate());
                datesChanged = true;
            }
            if (updateRequest.getCheckOutDate() != null) {
                booking.setCheckOutDate(updateRequest.getCheckOutDate());
                datesChanged = true;
            }
            if (updateRequest.getNumOfAdults() > 0)
                booking.setNumOfAdults(updateRequest.getNumOfAdults());
            booking.setNumOfChildren(updateRequest.getNumOfChildren());
            booking.calculateTotalnumberOfGuest();
            if (updateRequest.getPaymentStatus() != null)
                booking.setPaymentStatus(updateRequest.getPaymentStatus());
            if (updateRequest.getBookingStatus() != null)
                booking.setBookingStatus(updateRequest.getBookingStatus());

            if (datesChanged && booking.getRoom() != null) {
                Room room = roomRepository.findById(booking.getRoom().getId()).orElse(null);
                if (room != null) {
                    long totalDays = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
                    double basePrice = room.getRoomPrice().doubleValue() * totalDays;
                    double discountAmount = booking.getDiscountAmount() != null ? booking.getDiscountAmount() : 0;
                    booking.setTotalPrice(basePrice - discountAmount);
                }
            }

            bookingRepository.save(booking);
            response.setStatusCode(200);
            response.setMessage("Booking updated successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating booking: " + e.getMessage());
        }
        return response;
    }

    private boolean roomIsAvailable(Booking bookingRequest, List<Booking> existingBookings) {

        return existingBookings.stream()
                .noneMatch(existingBooking ->
                        bookingRequest.getCheckInDate().equals(existingBooking.getCheckInDate())
                                || bookingRequest.getCheckOutDate().isBefore(existingBooking.getCheckOutDate())
                                || (bookingRequest.getCheckInDate().isAfter(existingBooking.getCheckInDate())
                                && bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckOutDate()))
                                || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

                                && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckOutDate()))
                                || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

                                && bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckOutDate()))

                                || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
                                && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckInDate()))

                                || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
                                && bookingRequest.getCheckOutDate().equals(bookingRequest.getCheckInDate()))
                );
    }
}
