package com.eAuction.backend.dto;

import com.eAuction.backend.entity.enums.VerificationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class MiscDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycSubmissionRequest {
        @NotBlank(message = "Document type is required")
        private String documentType;

        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycUpdateStatusRequest {
        @NotNull(message = "Status is required")
        private VerificationStatus status;
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KycResponse {
        private Long kycId;
        private String userEmail;
        private String documentType;
        private VerificationStatus verificationStatus;
        private String remarks;
        private LocalDateTime submittedAt;
        private LocalDateTime verifiedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductFeedbackRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        private Integer rating;

        private String comment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductFeedbackResponse {
        private Long productId;
        private String userEmail;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }
}