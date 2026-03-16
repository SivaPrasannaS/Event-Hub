package com.eventhub.utils;

import com.eventhub.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {
    private final JwtConfig jwtConfig;

    public JwtUtils(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    public String generateAccessToken(String username) {
        return buildToken(username, jwtConfig.getExpirationMs(), "access");
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, jwtConfig.getRefreshExpirationMs(), "refresh");
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(parseClaims(token).get("type", String.class));
    }

    public boolean isTokenValid(String token) {
        Claims claims = parseClaims(token);
        return claims.getExpiration().after(new Date());
    }

    private String buildToken(String username, long expirationMs, String type) {
        Date now = new Date();
        return Jwts.builder()
            .subject(username)
            .claim("type", type)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith((javax.crypto.SecretKey) getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private Key getSigningKey() {
        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        } catch (Exception ex) {
            bytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(bytes.length >= 32 ? bytes : (jwtConfig.getSecret() + "eventhub-eventhub-eventhub-key").getBytes(StandardCharsets.UTF_8));
    }
}
