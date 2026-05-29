package com.BBTT.BBTTResort.service.impl;

import com.BBTT.BBTTResort.entity.RoomTranslation;
import com.BBTT.BBTTResort.repo.RoomTranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomTranslationService {

    @Autowired
    private RoomTranslationRepository repo;

    public RoomTranslation getTranslation(Long roomId, String lang) {
        return repo.findByRoomIdAndLanguageCode(roomId, lang)
                .orElse(null);
    }
}