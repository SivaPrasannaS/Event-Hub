package com.eventhub.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class JwtResponse {
    Long id;
    String username;
    List<String> roles;
    String accessToken;
    String refreshToken;
    String tokenType;
    Boolean active;
}
