package com.eAuction.backend.entity.enums;


public enum DeliveryStatus {
    ASSIGNED("Assigned"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    FAILED("Failed");

    private final String value;

    DeliveryStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
