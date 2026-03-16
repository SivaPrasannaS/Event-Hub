package com.eventhub.controllers;

import com.eventhub.dto.EventRequest;
import com.eventhub.dto.EventResponse;
import com.eventhub.dto.RsvpRequest;
import com.eventhub.dto.RsvpResponse;
import com.eventhub.enums.ContentStatus;
import com.eventhub.services.EventService;
import com.eventhub.services.RsvpService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    private final RsvpService rsvpService;

    public EventController(EventService eventService, RsvpService rsvpService) {
        this.eventService = eventService;
        this.rsvpService = rsvpService;
    }

    @GetMapping
    public Map<String, Object> getEvents(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "5") int size,
                                         @RequestParam(required = false) Long categoryId,
                                         @RequestParam(required = false) ContentStatus status,
                                         @RequestParam(required = false) Integer month,
                                         @RequestParam(required = false) String tag) {
        return eventService.getEvents(page, size, categoryId, status, month, tag);
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public EventResponse updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return Map.of("message", "Event deleted successfully");
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_ADMIN')")
    public EventResponse publishEvent(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean publish) {
        return eventService.publishEvent(id, publish);
    }

    @PostMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RsvpResponse> rsvp(@PathVariable Long id, @Valid @RequestBody RsvpRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rsvpService.save(id, request));
    }

    @GetMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    public RsvpResponse getRsvp(@PathVariable Long id) {
        return rsvpService.get(id);
    }

    @DeleteMapping("/{id}/rsvp")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> cancelRsvp(@PathVariable Long id) {
        rsvpService.cancel(id);
        return Map.of("message", "RSVP cancelled successfully");
    }
}
