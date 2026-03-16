package com.eventhub.services;

import com.eventhub.utils.JwtUtils;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtUtils jwtUtils;

    public JwtService(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    public String generateAccessToken(String username) {
        return jwtUtils.generateAccessToken(username);
    }

    public String generateRefreshToken(String username) {
        return jwtUtils.generateRefreshToken(username);
    }

    public String extractUsername(String token) {
        return jwtUtils.extractUsername(token);
    }

    public boolean isRefreshToken(String token) {
        return jwtUtils.isRefreshToken(token);
    }

    public boolean isTokenValid(String token) {
        return jwtUtils.isTokenValid(token);
    }
}
