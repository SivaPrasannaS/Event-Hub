package com.eventhub.dto;

import com.eventhub.enums.RsvpStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RsvpResponse {
    Long id;
    Long eventId;
    Long userId;
    String username;
    RsvpStatus status;
    LocalDateTime createdAt;
}
