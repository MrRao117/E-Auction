package com.eAuction.backend.dto;

import com.eAuction.backend.entity.enums.DeliveryStatus;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDTOs {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CreateOrderRequest{
        @NotNull(message = "Auction Id is required")
        private Long auctionId;

        @NotNull(message = "Address Id is required")
        private Long addressId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long orderId;
        private Long auctionId;
        private String auctionTitle;
        private String winnerName;
        private String winnerEmail;
        private BigDecimal winningAmount;
        private String shippingAddress;
        private OrderStatus orderStatus;
        private LocalDateTime orderDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatePaymentRequest {
        @NotNull(message = "Order Id is required")
        private Long orderId;

        @NotNull(message = "Total amount is required")
        @Positive
        private BigDecimal totalAmount;

        private BigDecimal taxAmount;
        private String method;
        private String transactionId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private Long paymentId;
        private Long orderId;
        private PaymentStatus paymentStatus;
        private BigDecimal totalAmount;
        private BigDecimal taxAmount;
        private String method;
        private String transactionId;
        private LocalDateTime paymentDate;
        private String paymentLink;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignDeliveryRequest {

        @NotNull(message = "Order Id is required")
        private Long orderId;

        @NotNull(message = "Agent Id is required")
        private Long agentId;

        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryResponse{
        private Long deliveryId;
        private Long orderId;
        private Long agentId;
        private String agentName;
        private DeliveryStatus deliveryStatus;
        private String remarks;
        private LocalDateTime assignedAt;
    }
}
