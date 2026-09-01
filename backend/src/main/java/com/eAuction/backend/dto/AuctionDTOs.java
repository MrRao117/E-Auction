package com.eAuction.backend.dto;

import com.eAuction.backend.entity.enums.AuctionStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AuctionDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateAuctionRequest {
        @NotNull(message = "Product Id is required")
        private Long productId;

        private String title;

        @NotNull(message = "Start time is required")
        @FutureOrPresent(message = "Start time can not be in the past")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        @Future(message = "End time must be in future")
        private LocalDateTime endTime;

        @NotNull(message = "Bid increment step is required")
        @Positive(message = "Bid increment must be positive")
        private BigDecimal bidIncrementedBy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuctionResponse {
        private Long auctionId;
        private Long productId;
        private String productTitle;
        private String title;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BigDecimal basePrice;
        private BigDecimal currHighestBid;
        private Long highestBidderId;
        private AuctionStatus auctionStatus;
        private BigDecimal bidIncrementedBy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterForAuctionRequest {
        @NotNull(message = "User Id is required")
        private Long userId;

        @NotNull(message = "Auction Id is required")
        private Long auctionId;
    }


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuctionRegistrationDetailsResponse {
        private Long userId;
        private String userName;
        private String userEmail;
        private String mobileNo;
        private LocalDateTime registeredAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegistrationCountResponse {
        private Long auctionId;
        private long totalRegistrations;
    }
}
