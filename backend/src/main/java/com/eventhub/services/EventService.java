package com.eventhub.services;

import com.eventhub.dto.EventRequest;
import com.eventhub.dto.EventResponse;
import com.eventhub.enums.ContentStatus;
import com.eventhub.exceptions.AccessDeniedException;
import com.eventhub.exceptions.ResourceNotFoundException;
import com.eventhub.models.AuditLog;
import com.eventhub.models.Category;
import com.eventhub.models.Event;
import com.eventhub.models.User;
import com.eventhub.models.Venue;
import com.eventhub.repositories.AuditLogRepository;
import com.eventhub.repositories.CategoryRepository;
import com.eventhub.repositories.EventRepository;
import com.eventhub.repositories.RsvpRepository;
import com.eventhub.repositories.VenueRepository;
import com.eventhub.utils.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EventService {
    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final RsvpRepository rsvpRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityUtils securityUtils;

    public EventService(EventRepository eventRepository, CategoryRepository categoryRepository, VenueRepository venueRepository,
                        RsvpRepository rsvpRepository, AuditLogRepository auditLogRepository, SecurityUtils securityUtils) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.venueRepository = venueRepository;
        this.rsvpRepository = rsvpRepository;
        this.auditLogRepository = auditLogRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEvents(int page, int size, Long categoryId, ContentStatus status, Integer month, String tag) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        Pageable pageable = PageRequest.of(page, size);
        Specification<Event> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (month != null) {
                predicates.add(cb.equal(cb.function("month", Integer.class, root.get("startDateTime")), month));
            }
            if (tag != null && !tag.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("tags")), "%" + tag.toLowerCase(Locale.ROOT) + "%"));
            }
            if (status != null) {
                if (canSeeNonPublished(currentUser)) {
                    predicates.add(cb.equal(root.get("status"), status));
                } else if (status == ContentStatus.PUBLISHED) {
                    predicates.add(cb.equal(root.get("status"), ContentStatus.PUBLISHED));
                } else {
                    predicates.add(cb.equal(root.get("organizer").get("id"), currentUser.map(User::getId).orElse(-1L)));
                    predicates.add(cb.equal(root.get("status"), status));
                }
            } else if (canSeeNonPublished(currentUser)) {
                // no extra filter
            } else {
                predicates.add(cb.equal(root.get("status"), ContentStatus.PUBLISHED));
            }
            query.orderBy(cb.asc(root.get("startDateTime")));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Page<Event> eventPage = eventRepository.findAll(specification, pageable);
        return Map.of(
            "items", eventPage.getContent().stream().map(this::toResponse).toList(),
            "total", eventPage.getTotalElements(),
            "page", eventPage.getNumber(),
            "size", eventPage.getSize()
        );
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(Long id) {
        Event event = eventRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (event.getStatus() == ContentStatus.PUBLISHED) {
            return toResponse(event);
        }
        User currentUser = securityUtils.getCurrentUserOptional().orElseThrow(() -> new AccessDeniedException("You do not have access to this event"));
        ensureEventMutationAccess(event, currentUser);
        return toResponse(event);
    }

    public EventResponse createEvent(EventRequest request) {
        validateEventDates(request);
        User currentUser = securityUtils.getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Venue venue = request.getVenueId() == null ? null : venueRepository.findById(request.getVenueId())
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        ContentStatus resolvedStatus = resolveRequestedStatus(request.getStatus(), currentUser);
        Event event = Event.builder()
            .title(request.getTitle().trim())
            .slug(generateUniqueSlug(request.getTitle()))
            .description(request.getDescription().trim())
            .startDateTime(request.getStartDateTime())
            .endDateTime(request.getEndDateTime())
            .status(resolvedStatus)
            .organizer(currentUser)
            .category(category)
            .tags(request.getTags())
            .venue(venue)
            .capacity(request.getCapacity())
            .publishedAt(resolvedStatus == ContentStatus.PUBLISHED ? LocalDateTime.now() : null)
            .build();
        eventRepository.save(event);
        auditLogRepository.save(AuditLog.builder()
            .action("EVENT_CREATE")
            .username(currentUser.getUsername())
            .details("Created event " + event.getTitle())
            .build());
        return toResponse(event);
    }

    public EventResponse updateEvent(Long id, EventRequest request) {
        validateEventDates(request);
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        ensureEventMutationAccess(event, currentUser);
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Venue venue = request.getVenueId() == null ? null : venueRepository.findById(request.getVenueId())
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        event.setTitle(request.getTitle().trim());
        event.setSlug(generateUniqueSlug(request.getTitle()) + "-" + event.getId());
        event.setDescription(request.getDescription().trim());
        event.setStartDateTime(request.getStartDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setCategory(category);
        event.setVenue(venue);
        event.setTags(request.getTags());
        event.setCapacity(request.getCapacity());
        ContentStatus resolvedStatus = resolveRequestedStatus(request.getStatus(), currentUser);
        event.setStatus(resolvedStatus);
        event.setPublishedAt(resolvedStatus == ContentStatus.PUBLISHED ? Optional.ofNullable(event.getPublishedAt()).orElse(LocalDateTime.now()) : null);
        auditLogRepository.save(AuditLog.builder()
            .action("EVENT_UPDATE")
            .username(currentUser.getUsername())
            .details("Updated event " + event.getTitle())
            .build());
        return toResponse(eventRepository.save(event));
    }

    public void deleteEvent(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        boolean isOwner = event.getOrganizer().getId().equals(currentUser.getId());
        boolean isManager = currentUser.hasRole("ROLE_MANAGER");
        boolean isAdmin = currentUser.hasRole("ROLE_ADMIN");
        if (!isOwner && !isManager && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this event");
        }
        eventRepository.delete(event);
        auditLogRepository.save(AuditLog.builder()
            .action("EVENT_DELETE")
            .username(currentUser.getUsername())
            .details("Deleted event " + event.getTitle())
            .build());
    }

    public EventResponse publishEvent(Long id, boolean publish) {
        User currentUser = securityUtils.getCurrentUser();
        Event event = eventRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!currentUser.hasRole("ROLE_MANAGER") && !currentUser.hasRole("ROLE_ADMIN")) {
            throw new AccessDeniedException("You do not have permission to publish events");
        }
        event.setStatus(publish ? ContentStatus.PUBLISHED : ContentStatus.DRAFT);
        event.setPublishedAt(publish ? LocalDateTime.now() : null);
        auditLogRepository.save(AuditLog.builder()
            .action(publish ? "EVENT_PUBLISH" : "EVENT_UNPUBLISH")
            .username(currentUser.getUsername())
            .details((publish ? "Published " : "Unpublished ") + event.getTitle())
            .build());
        return toResponse(eventRepository.save(event));
    }

    private void ensureEventMutationAccess(Event event, User currentUser) {
        boolean isOwner = event.getOrganizer().getId().equals(currentUser.getId());
        boolean isManager = currentUser.hasRole("ROLE_MANAGER");
        boolean isAdmin = currentUser.hasRole("ROLE_ADMIN");
        if (!isOwner && !isManager && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to modify this event");
        }
    }

    private boolean canSeeNonPublished(Optional<User> currentUser) {
        return currentUser.filter(user -> user.hasRole("ROLE_MANAGER") || user.hasRole("ROLE_ADMIN")).isPresent();
    }

    private ContentStatus resolveRequestedStatus(ContentStatus requestedStatus, User currentUser) {
        if (currentUser.hasRole("ROLE_USER") && !currentUser.hasRole("ROLE_MANAGER") && !currentUser.hasRole("ROLE_ADMIN")) {
            return ContentStatus.DRAFT;
        }
        return requestedStatus == null ? ContentStatus.DRAFT : requestedStatus;
    }

    private void validateEventDates(EventRequest request) {
        if (request.getStartDateTime() != null && request.getEndDateTime() != null && !request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new IllegalArgumentException("End date time must be after start date time");
        }
    }

    private String generateUniqueSlug(String title) {
        String base = Normalizer.normalize(title, Normalizer.Form.NFD)
            .replaceAll("[^\\p{ASCII}]", "")
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
        String slug = base;
        int counter = 1;
        while (eventRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
            .id(event.getId())
            .title(event.getTitle())
            .slug(event.getSlug())
            .description(event.getDescription())
            .startDateTime(event.getStartDateTime())
            .endDateTime(event.getEndDateTime())
            .status(event.getStatus())
            .organizerId(event.getOrganizer().getId())
            .organizerUsername(event.getOrganizer().getUsername())
            .categoryId(event.getCategory() == null ? null : event.getCategory().getId())
            .categoryName(event.getCategory() == null ? null : event.getCategory().getName())
            .tags(event.getTags())
            .venueId(event.getVenue() == null ? null : event.getVenue().getId())
            .venueName(event.getVenue() == null ? null : event.getVenue().getName())
            .capacity(event.getCapacity())
            .publishedAt(event.getPublishedAt())
            .createdAt(event.getCreatedAt())
            .updatedAt(event.getUpdatedAt())
            .rsvpCount(rsvpRepository.countByEventId(event.getId()))
            .build();
    }
}
