package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
    Optional<StaffProfile> findByUserId(Long userId);

    Optional<StaffProfile> findByEmail(String email);
}