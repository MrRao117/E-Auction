package com.eAuction.backend.controller;

import com.eAuction.backend.service.PaymentService;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments/webhook")
@RequiredArgsConstructor
public class RazorpayWebhookController {

    private final PaymentService paymentService;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        log.info("Received Razorpay Webhook Event");

        try {
            // 1. Verify Razorpay Signature
//            boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
//            if (!isValid) {
//                log.warn("Invalid Razorpay Webhook Signature!");
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
//            }

            // 2. Process Webhook Asynchronously
            paymentService.processWebhookEvent(payload);

            return ResponseEntity.ok("Webhook Processed Successfully");

        } catch (Exception e) {
            log.error("Error processing Razorpay webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook Handling Failed");
        }
    }
}