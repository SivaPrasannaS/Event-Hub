package com.eventhub.dto;

import com.eventhub.enums.ContentStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EventResponse {
    Long id;
    String title;
    String slug;
    String description;
    LocalDateTime startDateTime;
    LocalDateTime endDateTime;
    ContentStatus status;
    Long organizerId;
    String organizerUsername;
    Long categoryId;
    String categoryName;
    String tags;
    Long venueId;
    String venueName;
    Integer capacity;
    LocalDateTime publishedAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Long rsvpCount;
}
