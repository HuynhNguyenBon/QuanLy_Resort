package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.RoomTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomTranslationRepository
        extends JpaRepository<RoomTranslation, Long> {

    Optional<RoomTranslation>
    findByRoomIdAndLanguageCode(Long roomId, String languageCode);
}
