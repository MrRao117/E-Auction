package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {

    OrderDTOs.PaymentResponse processPayment(OrderDTOs.CreatePaymentRequest request);

    OrderDTOs.PaymentResponse getPaymentById(Long paymentId);

    OrderDTOs.PaymentResponse getPaymentByOrderId(Long orderId);

    OrderDTOs.PaymentResponse getPaymentByTransactionId(String transactionId);

    List<OrderDTOs.PaymentResponse> getAllPayments();

    OrderDTOs.PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status);
}