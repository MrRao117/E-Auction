package com.eAuction.backend.exception;

public class RazorpayServiceException extends RuntimeException {
    public RazorpayServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}