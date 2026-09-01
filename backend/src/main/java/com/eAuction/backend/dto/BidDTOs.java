package com.eAuction.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlaceBidRequest {
        private Long auctionId;
        private Long buyerId;

        @NotNull(message = "Bid amount is required")
        @Positive(message = "Bid amount must be greater than 0")
        private BigDecimal bidAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PublicBidResponse {
        private String bidderAlias; // Anonymized name (e.g., "T***2")
        private BigDecimal bidAmount;
        private LocalDateTime bidTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MyBidResponse {
        private BigDecimal bidAmount;
        private LocalDateTime bidTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminBidResponse {
        private Long bidId;
        private Long buyerId;
        private String buyerEmail;
        private String buyerName;
        private BigDecimal bidAmount;
        private LocalDateTime bidTime;
    }
}
