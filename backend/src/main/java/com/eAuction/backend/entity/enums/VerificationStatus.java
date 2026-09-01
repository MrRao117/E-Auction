package com.eAuction.backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum VerificationStatus {
    PENDING,
    VERIFIED,
    REJECTED;

    @JsonCreator
    public static VerificationStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return VerificationStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown status: " + value);
        }
    }
}
