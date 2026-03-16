package com.eventhub.dto;

import com.eventhub.enums.MediaType;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MediaResponse {
    Long id;
    String filename;
    String originalName;
    String url;
    MediaType mediaType;
    Long size;
    Long uploadedById;
    String uploadedByUsername;
    LocalDateTime createdAt;
}
