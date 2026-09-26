package com.eAuction.backend.messaging;

import com.eAuction.backend.config.KafkaTopicConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishBidEvent(Long auctionId, Long userId, Double amount) {
        try {
            Map<String, Object> payload = Map.of(
                    "auctionId", auctionId,
                    "userId", userId,
                    "amount", amount,
                    "timestamp", System.currentTimeMillis()
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            // Using auctionId as key ensures sequential ordering per auction
            kafkaTemplate.send(KafkaTopicConfig.BID_EVENTS_TOPIC, String.valueOf(auctionId), jsonPayload);
            log.info("Published bid event to Kafka topic [{}] for auction ID {}", KafkaTopicConfig.BID_EVENTS_TOPIC, auctionId);
        } catch (Exception e) {
            log.error("Failed to publish bid event to Kafka for auction ID {}", auctionId, e);
            // Non-blocking failure: primary HTTP bid response won't fail
        }
    }
}