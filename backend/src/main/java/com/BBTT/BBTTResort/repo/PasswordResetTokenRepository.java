package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByEmailAndOtp(
            String email,
            String otp
    );

    @Transactional
    void deleteByEmail(String email);
}