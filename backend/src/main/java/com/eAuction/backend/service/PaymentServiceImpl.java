package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.Auction;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AuctionOrderRepository orderRepository;
    private final OrderStatusHistoryService historyService;
    private final RazorpayGatewayClient razorpayGatewayClient; // Replaced direct RazorpayClient

    @Override
    public OrderDTOs.PaymentResponse processPayment(OrderDTOs.CreatePaymentRequest request) {
        log.info("Processing payment for order ID: {}", request.getOrderId());

        // 1. Fetch & Validate Order Data (Short read transaction)
        PaymentDetailsData details = getValidatedOrderDetails(request.getOrderId());

        // 2. Network Call to External Razorpay API via Resilience4j Client (NO DB Connection held open)
        PaymentLink paymentLink;
        try {
            paymentLink = razorpayGatewayClient.createPaymentLinkAsync(
                    request.getOrderId(),
                    details.totalAmount(),
                    details.customerName(),
                    details.customerEmail()
            ).join(); // Unwraps the CompletableFuture
        } catch (Exception e) {
            log.error("Error creating Razorpay Payment Link for order ID: {}", request.getOrderId(), e);
            throw new RuntimeException(e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
        }

        String razorpayPaymentLinkId = paymentLink.get("id");
        String razorpayShortUrl = paymentLink.get("short_url");

        // 3. Save Payment Record to Database (Short write transaction)
        Payment savedPayment = savePendingPaymentRecord(
                request.getOrderId(),
                details.totalAmount(),
                request.getMethod(),
                razorpayPaymentLinkId
        );

        OrderDTOs.PaymentResponse response = mapToPaymentResponse(savedPayment);
        response.setPaymentLink(razorpayShortUrl);

        return response;
    }

    @Transactional(readOnly = true)
    public PaymentDetailsData getValidatedOrderDetails(Long orderId) {
        AuctionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot process payment for a cancelled order.");
        }

        paymentRepository.findByOrder_OrderId(orderId).ifPresent(existingPayment -> {
            if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
                throw new InvalidOperationException("Payment has already been completed for this order.");
            }
        });

        Auction auction = order.getAuction();
        if (auction == null || auction.getCurrHighestBid() == null) {
            throw new InvalidOperationException("Invalid auction data or winning amount missing.");
        }

        BigDecimal totalAmount = auction.getCurrHighestBid();
        User winner = auction.getHighestBidder();

        String customerName = (winner != null && winner.getName() != null) ? winner.getName() : "Customer";
        String customerEmail = (winner != null && winner.getEmail() != null) ? winner.getEmail() : "customer@example.com";

        return new PaymentDetailsData(totalAmount, customerName, customerEmail);
    }

    @Transactional
    public Payment savePendingPaymentRecord(Long orderId, BigDecimal totalAmount, String method, String transactionId) {
        AuctionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseGet(Payment::new);

        payment.setOrder(order);
        payment.setTotalAmount(totalAmount);
        payment.setTaxAmount(BigDecimal.ZERO);
        payment.setMethod(method != null ? method : "RAZORPAY");
        payment.setTransactionId(transactionId);
        payment.setStatus(PaymentStatus.PENDING);

        return paymentRepository.save(payment);
    }

    @Override
    public void processWebhookEvent(String payload) {
        try {
            org.json.JSONObject json = new org.json.JSONObject(payload);
            String event = json.getString("event");

            log.info("Processing Webhook Event: {}", event);

            if ("payment.captured".equals(event) || "payment_link.paid".equals(event) || "order.paid".equals(event)) {

                org.json.JSONObject payloadObj = json.getJSONObject("payload");
                String paymentLinkId = null;

                if (payloadObj.has("payment_link")) {
                    paymentLinkId = payloadObj.getJSONObject("payment_link")
                            .getJSONObject("entity")
                            .getString("id");
                } else if (payloadObj.has("payment")) {
                    org.json.JSONObject paymentEntity = payloadObj.getJSONObject("payment").getJSONObject("entity");
                    if (paymentEntity.has("payment_link_id") && !paymentEntity.isNull("payment_link_id")) {
                        paymentLinkId = paymentEntity.getString("payment_link_id");
                    }
                }

                if (paymentLinkId != null) {
                    this.handlePaymentSuccess(paymentLinkId);
                } else {
                    log.warn("Could not extract payment_link_id from webhook payload");
                }
            }
        } catch (Exception e) {
            log.error("Error parsing webhook payload", e);
        }
    }

    @Transactional
    public void handlePaymentSuccess(String transactionId) {
        log.info("Handling payment success for transaction ID (Payment Link ID): {}", transactionId);

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with transaction id: " + transactionId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment transaction {} is already processed.", transactionId);
            return;
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        AuctionOrder order = payment.getOrder();
        if (order != null) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            historyService.logStatusChange(order, OrderStatus.CONFIRMED.name());
            log.info("Order ID {} status successfully updated to CONFIRMED via Webhook", order.getOrderId());
        }
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
    @Transactional
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

    public record PaymentDetailsData(BigDecimal totalAmount, String customerName, String customerEmail) {}
}