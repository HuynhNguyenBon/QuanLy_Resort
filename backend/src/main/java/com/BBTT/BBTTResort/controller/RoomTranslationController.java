package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.entity.RoomTranslation;
import com.BBTT.BBTTResort.repo.RoomTranslationRepository;
import com.BBTT.BBTTResort.service.impl.RoomTranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/translations")
public class RoomTranslationController {

    @Autowired
    private RoomTranslationRepository repo;

    @GetMapping("/{roomId}/{lang}")
    public ResponseEntity<?> getTranslation(
            @PathVariable Long roomId,
            @PathVariable String lang) {

        Optional<RoomTranslation> transOpt =
                repo.findByRoomIdAndLanguageCode(roomId, lang);

        if (transOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(transOpt.get());
    }
}