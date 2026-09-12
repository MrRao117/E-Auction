package com.eAuction.backend.controller;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.enums.PaymentStatus;
import com.eAuction.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<OrderDTOs.PaymentResponse> processPayment(@Valid @RequestBody OrderDTOs.CreatePaymentRequest request) {
        OrderDTOs.PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Razorpay redirects here after the buyer completes payment on the payment link page.
     * Public access is required as Razorpay performs the HTTP GET redirect.
     */
    @GetMapping("/callback")
    public ResponseEntity<String> handleRazorpayCallback(
            @RequestParam(name = "razorpay_payment_id") String razorpayPaymentId,
            @RequestParam(name = "razorpay_payment_link_id") String razorpayPaymentLinkId,
            @RequestParam(name = "razorpay_payment_link_status") String razorpayPaymentLinkStatus
    ) {
        if ("paid".equalsIgnoreCase(razorpayPaymentLinkStatus)) {
            // Find payment by link ID (transactionId) and update status to SUCCESS
            OrderDTOs.PaymentResponse payment = paymentService.getPaymentByTransactionId(razorpayPaymentLinkId);
            paymentService.updatePaymentStatus(payment.getPaymentId(), PaymentStatus.SUCCESS);
            return ResponseEntity.ok("Payment successful! Order #" + payment.getOrderId() + " is confirmed.");
        }
        return ResponseEntity.badRequest().body("Payment failed or incomplete.");
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'ADMIN')")
    public ResponseEntity<OrderDTOs.PaymentResponse> getPaymentById(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'ADMIN')")
    public ResponseEntity<OrderDTOs.PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'ADMIN')")
    public ResponseEntity<OrderDTOs.PaymentResponse> getPaymentByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentByTransactionId(transactionId));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTOs.PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PutMapping("/admin/{paymentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTOs.PaymentResponse> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam PaymentStatus status
    ) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(paymentId, status));
    }
}