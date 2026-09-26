package com.eAuction.backend.actuator;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisCustomHealthIndicator implements HealthIndicator {

    private final RedisConnectionFactory redisConnectionFactory;

    @Override
    public Health health() {
        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            String pong = connection.ping();
            if ("PONG".equalsIgnoreCase(pong)) {
                return Health.up().withDetail("redis", "Connection is alive and responding (PONG)").build();
            }
        } catch (Exception e) {
            return Health.down().withDetail("redis", "Failed to communicate with Redis: " + e.getMessage()).build();
        }
        return Health.down().withDetail("redis", "Unknown redis response error").build();
    }
}