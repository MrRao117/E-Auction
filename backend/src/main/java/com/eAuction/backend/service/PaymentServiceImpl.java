package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.Payment;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.entity.enums.PaymentStatus;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionOrderRepository;
import com.eAuction.backend.repository.PaymentRepository;
import com.razorpay.PaymentLink;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AuctionOrderRepository orderRepository;
    private final OrderStatusHistoryService historyService;
    private final RazorpayClient razorpayClient;

    @Override
    public OrderDTOs.PaymentResponse processPayment(OrderDTOs.CreatePaymentRequest request) {
        log.info("Processing payment for order ID: {}", request.getOrderId());

        // 1. Fetch & Validate Order
        AuctionOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot process payment for a cancelled order.");
        }

        // 2. Check existing successful payment
        paymentRepository.findByOrder_OrderId(request.getOrderId()).ifPresent(existingPayment -> {
            if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
                throw new InvalidOperationException("Payment has already been completed for this order.");
            }
        });

        // 3. Create Payment Link with Razorpay
        PaymentLink paymentLink;
        try {
            JSONObject paymentLinkRequest = new JSONObject();

            // Amount in paise (1 INR = 100 Paise)
            long amountInPaise = request.getTotalAmount().multiply(new BigDecimal("100")).longValue();
            paymentLinkRequest.put("amount", amountInPaise);
            paymentLinkRequest.put("currency", "INR");
            paymentLinkRequest.put("accept_partial", false);
            paymentLinkRequest.put("description", "Payment for Order #" + order.getOrderId());

            // Extract winner details from order -> auction -> highestBidder (User entity)
            User winner = (order.getAuction() != null) ? order.getAuction().getHighestBidder() : null;
            String customerName = (winner != null && winner.getName() != null) ? winner.getName() : "Customer";
            String customerEmail = (winner != null && winner.getEmail() != null) ? winner.getEmail() : "customer@example.com";

            // Customer Details
            JSONObject customer = new JSONObject();
            customer.put("name", customerName);
            customer.put("email", customerEmail);
            paymentLinkRequest.put("customer", customer);

            // Redirection after payment completes
            JSONObject notify = new JSONObject();
            notify.put("email", true);
            notify.put("sms", false);
            paymentLinkRequest.put("notify", notify);
            paymentLinkRequest.put("callback_url", "http://localhost:8080/api/v1/payments/callback");
            paymentLinkRequest.put("callback_method", "get");

            paymentLink = razorpayClient.paymentLink.create(paymentLinkRequest);

        } catch (RazorpayException e) {
            log.error("Error creating Razorpay Payment Link", e);
            throw new RuntimeException("Failed to initiate payment with Razorpay: " + e.getMessage());
        }

        String razorpayPaymentLinkId = paymentLink.get("id");
        String razorpayShortUrl = paymentLink.get("short_url"); // hosted payment page

        // 4. Save Payment Record with PENDING status
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setTotalAmount(request.getTotalAmount());
        payment.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        payment.setMethod(request.getMethod() != null ? request.getMethod() : "RAZORPAY");
        payment.setTransactionId(razorpayPaymentLinkId);
        payment.setStatus(PaymentStatus.PENDING); // Mark as PENDING until verified via Webhook/Callback

        Payment savedPayment = paymentRepository.save(payment);

        // 5. Build Response including the Razorpay link
        OrderDTOs.PaymentResponse response = mapToPaymentResponse(savedPayment);
        response.setPaymentLink(razorpayShortUrl);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.PaymentResponse getPaymentById(Long paymentId) {
        log.info("Fetching payment details for payment ID: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        return mapToPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.PaymentResponse getPaymentByOrderId(Long orderId) {
        log.info("Fetching payment details for order ID: {}", orderId);

        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for order id: " + orderId));

        return mapToPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.PaymentResponse getPaymentByTransactionId(String transactionId) {
        log.info("Fetching payment details for transaction ID: {}", transactionId);

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with transaction id: " + transactionId));

        return mapToPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTOs.PaymentResponse> getAllPayments() {
        log.info("Fetching all payment records");

        return paymentRepository.findAll().stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTOs.PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status) {
        log.info("Updating payment status for payment ID: {} to {}", paymentId, status);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        payment.setStatus(status);

        AuctionOrder order = payment.getOrder();
        if (order != null) {
            if (status == PaymentStatus.SUCCESS) {
                order.setOrderStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
                historyService.logStatusChange(order, OrderStatus.CONFIRMED.name());
            } else if (status == PaymentStatus.FAILED || status == PaymentStatus.REFUNDED) {
                order.setOrderStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                historyService.logStatusChange(order, OrderStatus.CANCELLED.name());
            }
        }

        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Payment ID {} status updated to {}", paymentId, status);

        return mapToPaymentResponse(updatedPayment);
    }

    private OrderDTOs.PaymentResponse mapToPaymentResponse(Payment payment) {
        OrderDTOs.PaymentResponse response = new OrderDTOs.PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setOrderId(payment.getOrder() != null ? payment.getOrder().getOrderId() : null);
        response.setPaymentStatus(payment.getStatus());
        response.setTotalAmount(payment.getTotalAmount());
        response.setTaxAmount(payment.getTaxAmount());
        response.setMethod(payment.getMethod());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getPaymentDate());
        return response;
    }
}