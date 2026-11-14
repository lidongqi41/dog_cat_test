package com.warmpaws.auth;

import com.warmpaws.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expireSeconds;

    public JwtService(AppProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.jwt().secret().getBytes(StandardCharsets.UTF_8));
        this.expireSeconds = properties.jwt().expireSeconds();
    }

    public String create(Long id, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claim("role", role)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expireSeconds * 1000))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long expireSeconds() {
        return expireSeconds;
    }
}
