package com.eAuction.backend.service;

import com.eAuction.backend.dto.BidDTOs;
import com.eAuction.backend.messaging.BidEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidAsyncEventExecutor {

    private final SimpMessagingTemplate messagingTemplate;
    private final BidEventPublisher bidEventPublisher;

    @Async
    public void publishBidSideEffects(Long auctionId, Long buyerId, BigDecimal bidAmount, BidDTOs.PublicBidResponse publicResponse) {
        try {
            // 1. WebSocket Real-Time Broadcast
            messagingTemplate.convertAndSend("/topic/auctions/" + auctionId + "/bids", publicResponse);

            // 2. Kafka Event Publishing
            bidEventPublisher.publishBidEvent(auctionId, buyerId, bidAmount.doubleValue());

            log.debug("Successfully executed async side effects for auction ID: {}", auctionId);
        } catch (Exception e) {
            log.error("Failed to process async bid side effects for auction ID: {}", auctionId, e);
        }
    }
}