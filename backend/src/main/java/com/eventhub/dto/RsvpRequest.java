package com.eventhub.dto;

import com.eventhub.enums.RsvpStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RsvpRequest {
    @NotNull(message = "RSVP status is required")
    private RsvpStatus status;
}
