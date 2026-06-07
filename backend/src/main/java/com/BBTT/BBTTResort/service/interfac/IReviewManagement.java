package com.BBTT.BBTTResort.service.interfac;

import com.BBTT.BBTTResort.dto.Response;

public interface IReviewManagement {
    Response getReviewsByRoom(Long roomId);
    Response getAllReviews();
    Response addReview(Long roomId, String name, Integer rating, String comment);
    Response deleteReview(Long reviewId);
    Response deleteReviewsByRoom(Long roomId);
}