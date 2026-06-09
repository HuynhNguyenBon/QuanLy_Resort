package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByEmailAndOtp(
            String email,
            String otp
    );

    @Transactional
    void deleteByEmail(String email);
}