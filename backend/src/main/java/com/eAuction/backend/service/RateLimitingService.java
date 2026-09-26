package com.eAuction.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    // In-memory cache mapping client IPs to their respective rate-limit buckets
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Retrieves or creates a Bucket for a specific IP.
     * Limit: 10 requests per minute per IP.
     */
    public Bucket resolveBucket(String ipAddress) {
        return buckets.computeIfAbsent(ipAddress, key -> createNewBucket());
    }

    private Bucket createNewBucket() {
        // Allows a capacity of 10 tokens, refilling 10 tokens every 1 minute
        Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}