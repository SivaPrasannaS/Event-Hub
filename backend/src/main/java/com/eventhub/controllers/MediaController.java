package com.eventhub.controllers;

import com.eventhub.dto.MediaRequest;
import com.eventhub.dto.MediaResponse;
import com.eventhub.services.MediaService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getMedia(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "5") int size,
                                        @RequestParam(required = false) String search) {
        return mediaService.getMedia(page, size, search);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MediaResponse> upload(@Valid @ModelAttribute MediaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mediaService.upload(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> delete(@PathVariable Long id) {
        mediaService.delete(id);
        return Map.of("message", "Media deleted successfully");
    }
}
