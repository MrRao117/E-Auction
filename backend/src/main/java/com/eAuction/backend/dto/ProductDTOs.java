package com.eAuction.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class ProductDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateCategoryRequest {
        @NotBlank(message = "Category name is required")
        @Size(max = 100)
        private String categoryName;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategoryResponse{
        private Long categoryId;
        private String categoryName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateProductRequest {
        private Long categoryId;

        @NotBlank(message = "Product name is required")
        private String pname;

        private String description;

        @NotNull(message = "Base price is required")
        @Positive(message = "Base price must be greater than 0")
        private BigDecimal basePrice;

        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductResponse {
        private Long productId;
        private String pname;
        private String description;
        private BigDecimal basePrice;
        private String imageUrl;
        private Boolean isVerified;
        private Long categoryId;
        private String categoryName;
        private String sellerEmail;
        private String sellerName;
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyProductRequest {
        private Boolean isVerified;
        private String remarks;

    }
}
