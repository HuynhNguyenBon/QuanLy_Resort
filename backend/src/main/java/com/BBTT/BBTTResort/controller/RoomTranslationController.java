package com.BBTT.BBTTResort.controller;

import com.BBTT.BBTTResort.entity.RoomTranslation;
import com.BBTT.BBTTResort.repo.RoomTranslationRepository;
import com.BBTT.BBTTResort.service.impl.RoomTranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/translations")
public class RoomTranslationController {

    @Autowired
    private RoomTranslationService roomTranslationService;

    @GetMapping("/{roomId}/{lang}")
    public ResponseEntity<?> getTranslation(@PathVariable Long roomId, @PathVariable String lang) {
        RoomTranslation trans = roomTranslationService.getTranslation(roomId, lang);
        if (trans == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(trans);
    }

    @PostMapping("/{roomId}/{lang}")
    public ResponseEntity<?> saveTranslation(
            @PathVariable Long roomId,
            @PathVariable String lang,
            @RequestBody Map<String, String> body) {
        RoomTranslation saved = roomTranslationService.saveTranslation(
                roomId, lang,
                body.get("roomType"),
                body.get("roomDescription")
        );
        return ResponseEntity.ok(saved);
    }
}
