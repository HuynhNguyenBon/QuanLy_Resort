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

    public RoomTranslation saveTranslation(Long roomId, String lang, String roomType, String roomDescription) {
        RoomTranslation trans = repo.findByRoomIdAndLanguageCode(roomId, lang)
                .orElse(new RoomTranslation());
        trans.setRoomId(roomId);
        trans.setLanguageCode(lang);
        if (roomType        != null) trans.setRoomType(roomType);
        if (roomDescription != null) trans.setRoomDescription(roomDescription);
        return repo.save(trans);
    }
}