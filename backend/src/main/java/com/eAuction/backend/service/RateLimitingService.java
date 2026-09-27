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
public class RateLimitingService {

    private final ProxyManager<byte[]> proxyManager;

    public RateLimitingService(ProxyManager<byte[]> proxyManager) {
        this.proxyManager = proxyManager;
    }

    public Bucket resolveBucket(String ipAddress) {
        String key = "rate_limit_ip_" + ipAddress;
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);

        BucketConfiguration configuration = BucketConfiguration.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build();

        return proxyManager.builder().build(keyBytes, configuration);
    }
}