package com.eAuction.backend.actuator;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class RazorpayHealthIndicator implements HealthIndicator {

    private final String keyId;
    private final String keySecret;

    public RazorpayHealthIndicator(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @Override
    public Health health() {
        try {
            // Validate client instantiation parameters and configuration integrity
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            if (client != null) {
                return Health.up().withDetail("razorpay", "Client initialized and credentials configured successfully").build();
            }
            return Health.down().withDetail("razorpay", "Razorpay client instance is null").build();
        } catch (Exception e) {
            return Health.down().withDetail("razorpay", "Initialization error: " + e.getMessage()).build();
        }
    }
}