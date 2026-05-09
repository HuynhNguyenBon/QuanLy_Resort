package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingServiceRepository extends JpaRepository<BookingService, Long>{

    // Custom query để lấy tất cả dịch vụ của một booking cụ thể
    List<BookingService> findByBookingId(Long bookingId);
}
