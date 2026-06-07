package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.service.interfac.IReviewManagement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private IReviewManagement reviewManagement;

    // Lấy đánh giá theo phòng (công khai)
    @GetMapping("/room/{roomId}")
    public ResponseEntity<Response> getReviewsByRoom(@PathVariable("roomId") Long roomId) {
        Response response = reviewManagement.getReviewsByRoom(roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Lấy tất cả đánh giá (Admin)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllReviews() {
        Response response = reviewManagement.getAllReviews();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Gửi đánh giá mới (công khai - khách không cần đăng nhập)
    @PostMapping("/add")
    public ResponseEntity<Response> addReview(
            @RequestParam("roomId") Long roomId,
            @RequestParam("name") String name,
            @RequestParam("rating") Integer rating,
            @RequestParam("comment") String comment) {
        Response response = reviewManagement.addReview(roomId, name, rating, comment);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Xoá 1 đánh giá (Admin)
    @DeleteMapping("/delete/{reviewId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteReview(@PathVariable("reviewId") Long reviewId) {
        Response response = reviewManagement.deleteReview(reviewId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // Xoá toàn bộ đánh giá của 1 phòng (Admin)
    @DeleteMapping("/room/{roomId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteReviewsByRoom(@PathVariable("roomId") Long roomId) {
        Response response = reviewManagement.deleteReviewsByRoom(roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}