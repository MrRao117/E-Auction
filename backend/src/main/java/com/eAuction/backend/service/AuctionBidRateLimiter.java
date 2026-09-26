package com.eAuction.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuctionBidRateLimiter {

    // Key format: "userId:auctionId"
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsumeBid(Long userId, Long auctionId) {
        String key = userId + ":" + auctionId;
        Bucket bucket = buckets.computeIfAbsent(key, k -> createNewBucket());
        return bucket.tryConsume(1);
    }

    private Bucket createNewBucket() {
        // Business rule: Allow 1 bid every 3 seconds per auction, with a burst capacity of 2 tokens
        Refill refill = Refill.greedy(1, Duration.ofSeconds(3));
        Bandwidth limit = Bandwidth.classic(2, refill);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}