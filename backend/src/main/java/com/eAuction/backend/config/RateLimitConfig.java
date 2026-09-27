package com.eAuction.backend.config;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.Bucket4jLettuce;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.RedisClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RateLimitConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Bean
    public ProxyManager<byte[]> proxyManager() {
        // Construct a direct standalone Lettuce RedisClient using your configuration properties
        String uri = "redis://" + (redisPassword.isEmpty() ? "" : ":" + redisPassword + "@") + redisHost + ":" + redisPort;
        RedisClient redisClient = RedisClient.create(uri);

        StatefulRedisConnection<byte[], byte[]> connection = redisClient.connect(new ByteArrayCodec());

        // Use Bucket4jLettuce.casBasedBuilder instead of LettuceBasedProxyManager.builderFor
        return Bucket4jLettuce.casBasedBuilder(connection)
                .expirationAfterWrite(ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(10)))
                .build();
    }
}