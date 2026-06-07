package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.dto.Response;
import com.BBTT.BBTTResort.dto.ReviewDTO;
import com.BBTT.BBTTResort.entity.Review;
import com.BBTT.BBTTResort.repo.ReviewRepository;
import com.BBTT.BBTTResort.service.interfac.IReviewManagement;
import com.BBTT.BBTTResort.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ReviewManagement implements IReviewManagement {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired private ReviewRepository reviewRepo;

    @Override
    public Response getReviewsByRoom(Long roomId) {
        Response response = new Response();
        try {
            List<Review> list = reviewRepo.findByRoomIdOrderByIdDesc(roomId);
            response.setStatusCode(200);
            response.setReviewList(list.stream().map(Utils::mapReviewToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching reviews: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllReviews() {
        Response response = new Response();
        try {
            List<Review> list = reviewRepo.findAll();
            response.setStatusCode(200);
            response.setReviewList(list.stream().map(Utils::mapReviewToDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching reviews: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response addReview(Long roomId, String name, Integer rating, String comment) {
        Response response = new Response();
        try {
            Review review = new Review();
            review.setRoomId(roomId);
            review.setName(name);
            review.setRating(rating);
            review.setComment(comment);
            review.setDate(LocalDate.now().format(DATE_FORMAT));
            reviewRepo.save(review);
            response.setStatusCode(200);
            response.setMessage("Review added successfully!");
            response.setReview(Utils.mapReviewToDTO(review));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Review save error: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteReview(Long reviewId) {
        Response response = new Response();
        try {
            if (reviewRepo.existsById(reviewId)) {
                reviewRepo.deleteById(reviewId);
                response.setStatusCode(200);
                response.setMessage("Review successfully removed!");
            } else {
                response.setStatusCode(404);
                response.setMessage("No review found with ID: " + reviewId);
            }
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error when deleting review: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteReviewsByRoom(Long roomId) {
        Response response = new Response();
        try {
            reviewRepo.deleteByRoomId(roomId);
            response.setStatusCode(200);
            response.setMessage("Reviews for room successfully removed!");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error when deleting reviews: " + e.getMessage());
        }
        return response;
    }
}