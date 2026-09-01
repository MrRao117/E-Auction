package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.Payment;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.entity.enums.PaymentStatus;
import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionOrderRepository;
import com.eAuction.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AuctionOrderRepository orderRepository;

    @Override
    public OrderDTOs.PaymentResponse processPayment(OrderDTOs.CreatePaymentRequest request) {
        log.info("Processing payment for order ID: {} with total amount: {}", request.getOrderId(), request.getTotalAmount());

        // 1. Fetch and validate Order
        AuctionOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> {
                    log.warn("Payment failed. Order not found with ID: {}", request.getOrderId());
                    return new ResourceNotFoundException("Order not found with id: " + request.getOrderId());
                });

        // 2. Prevent payment if Order is cancelled
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            log.warn("Payment failed. Order ID {} is already cancelled.", request.getOrderId());
            throw new InvalidOperationException("Cannot process payment for a cancelled order.");
        }

        // 3. Ensure a successful payment doesn't already exist for this order
        paymentRepository.findByOrder_OrderId(request.getOrderId()).ifPresent(existingPayment -> {
            if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
                log.warn("Payment failed. Order ID {} already has a completed payment.", request.getOrderId());
                throw new InvalidOperationException("Payment has already been completed for this order.");
            }
        });

        // 4. Handle Transaction ID (generate one if null/blank, or check uniqueness if provided)
        String transactionId = request.getTransactionId();
        if (transactionId == null || transactionId.isBlank()) {
            transactionId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        } else if (paymentRepository.existsByTransactionId(transactionId)) {
            log.warn("Payment failed. Transaction ID {} already exists.", transactionId);
            throw new DuplicateResourceException("Transaction ID already exists: " + transactionId);
        }

        // 5. Build and populate Payment entity
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setTotalAmount(request.getTotalAmount());
        payment.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        payment.setMethod(request.getMethod() != null ? request.getMethod() : "CARD");
        payment.setTransactionId(transactionId);
        payment.setStatus(PaymentStatus.SUCCESS); // Default to SUCCESS upon successful processing

        Payment savedPayment = paymentRepository.save(payment);

        // 6. Update Order Status following successful payment
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        log.info("Payment ID {} processed successfully with Transaction ID {}", savedPayment.getPaymentId(), transactionId);

        return mapToPaymentResponse(savedPayment);
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

        // Update corresponding order status if payment failed/refunded
        if (status == PaymentStatus.FAILED || status == PaymentStatus.REFUNDED) {
            AuctionOrder order = payment.getOrder();
            if (order != null) {
                order.setOrderStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
        }

        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Payment ID {} status updated to {}", paymentId, status);

        return mapToPaymentResponse(updatedPayment);
    }

    // Helper mapper from Entity to Response
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