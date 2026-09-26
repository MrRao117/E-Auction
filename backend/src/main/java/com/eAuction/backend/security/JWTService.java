package com.eAuction.backend.security;

import com.eAuction.backend.entity.Admin;
import com.eAuction.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JWTService {

    @Value("${jwt.secretKey}")
    private String jwtSecretKey;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecretKey.getBytes(StandardCharsets.UTF_8));
    }

    @PostConstruct
    public void init() {
        if (jwtSecretKey == null || jwtSecretKey.trim().length() < 32) {
            throw new IllegalArgumentException(
                    "FATAL SECURITY RISK: 'jwt.secretKey' must be provided as an environment variable and be at least 32 characters (256 bits) long!"
            );
        }
    }

    public String generateAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getUserId())
                .claim("role", "ROLE_" + user.getUserRole().name()) // Prefix with ROLE_ for Spring Security
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 Hour
                .signWith(getSecretKey())
                .compact();
    }

    // --- OVERLOAD: For Admin Entity ---
    public String generateAdminAccessToken(Admin admin) {
        return Jwts.builder()
                .subject(admin.getEmail())
                .claim("adminId", admin.getAdminId())
                .claim("role", "ROLE_ADMIN") // Prefix with ROLE_ for Spring Security
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 Hour
                .signWith(getSecretKey())
                .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getUserId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7)) // 7 Days
                .signWith(getSecretKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // SAFE SAFEGUARD: Prevents ClassCastException when JJWT deserializes JSON numbers as Integer
    public Long extractUserId(String token) {
        Object userIdObj = extractAllClaims(token).get("userId");
        if (userIdObj instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, String userEmail) {
        final String extractedEmail = extractUsername(token);
        return (extractedEmail.equals(userEmail) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}