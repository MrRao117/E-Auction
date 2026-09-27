package com.eAuction.backend.actuator;

import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("razorpayHealthIndicator")
public class RazorpayHealthIndicator implements HealthIndicator {

    private final String keyId;
    private final String keySecret;

    // Caching fields to prevent API rate-limiting and external blip cascading
    private Health cachedHealth;
    private long lastCheckedTimestamp = 0;
    private static final long CACHE_TTL_MS = 45_000; // 45 seconds cache window

    public RazorpayHealthIndicator(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @Override
    public synchronized Health health() {
        long now = System.currentTimeMillis();

        // Return cached health if within the TTL window
        if (cachedHealth != null && (now - lastCheckedTimestamp) < CACHE_TTL_MS) {
            return cachedHealth;
        }

        try {
            // Initialize the client
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            // Perform lightweight authenticated API check
            JSONObject params = new JSONObject();
            params.put("count", 1);
            client.payments.fetchAll(params);

            cachedHealth = Health.up()
                    .withDetail("razorpay", "Successfully connected and authenticated with Razorpay API")
                    .build();

        } catch (Exception e) {
            cachedHealth = Health.down()
                    .withDetail("razorpay", "Health check failed (cached or temporary): " + e.getMessage())
                    .build();
        }

        lastCheckedTimestamp = now;
        return cachedHealth;
    }
}