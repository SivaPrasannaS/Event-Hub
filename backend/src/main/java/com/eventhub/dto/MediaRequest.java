package com.eventhub.dto;

import com.eventhub.enums.MediaType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class MediaRequest {
    @NotNull(message = "File is required")
    private MultipartFile file;

    @NotNull(message = "Media type is required")
    private MediaType mediaType;
}
