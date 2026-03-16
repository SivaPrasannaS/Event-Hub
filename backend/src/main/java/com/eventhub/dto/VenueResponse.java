package com.eventhub.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class VenueResponse {
    Long id;
    String name;
    String address;
    String city;
    String country;
    Integer capacity;
    LocalDateTime createdAt;
}
