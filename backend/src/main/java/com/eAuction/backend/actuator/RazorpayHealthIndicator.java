package com.eAuction.backend.actuator;

import com.razorpay.RazorpayClient;
import org.json.JSONObject;
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
            // Initialize the client
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            // Perform a lightweight, authenticated API call to test connectivity and key validity
            JSONObject params = new JSONObject();
            params.put("count", 1);
            client.payments.fetchAll(params); // This contacts Razorpay servers

            return Health.up()
                    .withDetail("razorpay", "Successfully connected and authenticated with Razorpay API")
                    .build();

        } catch (Exception e) {
            return Health.down()
                    .withDetail("razorpay", "Health check failed: " + e.getMessage())
                    .build();
        }
    }
}