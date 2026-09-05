package com.eAuction.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class OrderStatusHistoryDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryResponse {
        private Long historyId;
        private Long orderId;
        private String status;
        private LocalDateTime createdAt;
    }
}