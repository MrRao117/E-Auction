package com.eAuction.backend.service;

import com.razorpay.PaymentLink;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class RazorpayGatewayClient {

    private final RazorpayClient razorpayClient;

    @CircuitBreaker(name = "razorpayService", fallbackMethod = "createPaymentLinkFallback")
    @Retry(name = "razorpayService")
    @Bulkhead(name = "razorpayService", type = Bulkhead.Type.SEMAPHORE)
    @TimeLimiter(name = "razorpayService")
    public CompletableFuture<PaymentLink> createPaymentLinkAsync(
            Long orderId, BigDecimal totalAmount, String customerName, String customerEmail) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                JSONObject paymentLinkRequest = new JSONObject();

                long amountInPaise = totalAmount.multiply(new BigDecimal("100")).longValueExact();
                paymentLinkRequest.put("amount", amountInPaise);
                paymentLinkRequest.put("currency", "INR");
                paymentLinkRequest.put("accept_partial", false);
                paymentLinkRequest.put("description", "Payment for Order #" + orderId);

                JSONObject customer = new JSONObject();
                customer.put("name", customerName);
                customer.put("email", customerEmail);
                paymentLinkRequest.put("customer", customer);

                JSONObject notify = new JSONObject();
                notify.put("email", true);
                notify.put("sms", false);
                paymentLinkRequest.put("notify", notify);
                paymentLinkRequest.put("callback_url", "http://localhost:8080/api/v1/payments/callback");
                paymentLinkRequest.put("callback_method", "get");

                return razorpayClient.paymentLink.create(paymentLinkRequest);

            } catch (RazorpayException e) {
                log.error("Razorpay exception during payment link creation for order ID: {}", orderId, e);
                throw new RuntimeException("Failed to initiate payment with Razorpay: " + e.getMessage(), e);
            }
        });
    }

    // Fallback method matching signature + Throwable
    public CompletableFuture<PaymentLink> createPaymentLinkFallback(
            Long orderId, BigDecimal totalAmount, String customerName, String customerEmail, Throwable t) {
        log.error("Razorpay service fallback triggered for order ID: {}. Reason: {}", orderId, t.getMessage());
        throw new RuntimeException("Payment Gateway is currently unavailable. Please try again later. Root cause: " + t.getMessage());
    }
}