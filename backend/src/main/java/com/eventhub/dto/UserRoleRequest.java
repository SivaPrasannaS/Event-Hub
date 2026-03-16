package com.eventhub.dto;

import com.eventhub.enums.ERole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRoleRequest {
    @NotNull(message = "Role is required")
    private ERole role;
}
