package com.eAuction.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class AuctionBidRateLimiter {

    private final ProxyManager<byte[]> proxyManager;

    public AuctionBidRateLimiter(ProxyManager<byte[]> proxyManager) {
        this.proxyManager = proxyManager;
    }

    public boolean tryConsumeBid(Long userId, Long auctionId) {
        String key = "bid_limit_" + userId + ":" + auctionId;
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);

        BucketConfiguration configuration = BucketConfiguration.builder()
                .addLimit(limit -> limit.capacity(1).refillIntervally(1, Duration.ofSeconds(3)))
                .build();

        Bucket bucket = proxyManager.builder().build(keyBytes, configuration);
        return bucket.tryConsume(1);
    }
}