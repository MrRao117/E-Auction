package com.eAuction.backend.messaging;

import com.eAuction.backend.config.KafkaTopicConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidEventConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopicConfig.BID_EVENTS_TOPIC, groupId = "eauction-bid-group")
    public void consumeBidEvent(String message) {
        try {
            JsonNode data = objectMapper.readTree(message);

            Long auctionId = data.path("auctionId").asLong();
            Long userId = data.path("userId").asLong();
            Double amount = data.path("amount").asDouble();

            log.info("Kafka Event Processed: Auction ID={}, User ID={}, Bid Amount={}", auctionId, userId, amount);

            // TODO: Execute async operations (Audit log DB insert, Email alerts, Real-time analytics counter)

        } catch (Exception e) {
            log.error("Error processing Kafka bid event message", e);
        }
    }
}