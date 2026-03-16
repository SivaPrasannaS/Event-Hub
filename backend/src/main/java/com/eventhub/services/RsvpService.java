package com.eventhub.services;

import com.eventhub.dto.RsvpRequest;
import com.eventhub.dto.RsvpResponse;
import com.eventhub.enums.ContentStatus;
import com.eventhub.exceptions.AccessDeniedException;
import com.eventhub.exceptions.ResourceNotFoundException;
import com.eventhub.models.Event;
import com.eventhub.models.Rsvp;
import com.eventhub.models.User;
import com.eventhub.repositories.EventRepository;
import com.eventhub.repositories.RsvpRepository;
import com.eventhub.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RsvpService {
    private final RsvpRepository rsvpRepository;
    private final EventRepository eventRepository;
    private final SecurityUtils securityUtils;

    public RsvpService(RsvpRepository rsvpRepository, EventRepository eventRepository, SecurityUtils securityUtils) {
        this.rsvpRepository = rsvpRepository;
        this.eventRepository = eventRepository;
        this.securityUtils = securityUtils;
    }

    public RsvpResponse save(Long eventId, RsvpRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findWithDetailsById(eventId).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (event.getStatus() != ContentStatus.PUBLISHED) {
            throw new AccessDeniedException("Cannot RSVP to unpublished event");
        }
        Rsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, currentUser.getId())
            .orElse(Rsvp.builder().event(event).user(currentUser).build());
        rsvp.setStatus(request.getStatus());
        return toResponse(rsvpRepository.save(rsvp));
    }

    @Transactional(readOnly = true)
    public RsvpResponse get(Long eventId) {
        User currentUser = securityUtils.getCurrentUser();
        Rsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("RSVP not found"));
        return toResponse(rsvp);
    }

    public void cancel(Long eventId) {
        User currentUser = securityUtils.getCurrentUser();
        Rsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("RSVP not found"));
        rsvpRepository.delete(rsvp);
    }

    private RsvpResponse toResponse(Rsvp rsvp) {
        return RsvpResponse.builder()
            .id(rsvp.getId())
            .eventId(rsvp.getEvent().getId())
            .userId(rsvp.getUser().getId())
            .username(rsvp.getUser().getUsername())
            .status(rsvp.getStatus())
            .createdAt(rsvp.getCreatedAt())
            .build();
    }
}
