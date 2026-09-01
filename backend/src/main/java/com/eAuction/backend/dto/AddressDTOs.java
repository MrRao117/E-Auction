package com.eAuction.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AddressDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateAddressRequest {

        @Size(max = 50)
        private String houseNo;

        @NotBlank(message = "Village/City is required")
        @Size(max = 100)
        private String villageCity;

        @NotBlank(message = "District is required")
        @Size(max = 100)
        private String district;

        @NotBlank(message = "State is required")
        @Size(max = 100)
        private String state;

        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid Indian pincode")
        private String pincode;

        private Boolean isDefault;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressResponse {
        private Long addressId;
        private String houseNo;
        private String villageCity;
        private String district;
        private String state;
        private String pincode;
        private Boolean isDefault;
    }
}