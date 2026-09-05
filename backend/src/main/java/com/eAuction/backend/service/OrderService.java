package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderDTOs.OrderResponse createOrder(OrderDTOs.CreateOrderRequest request);

    OrderDTOs.OrderResponse createAutomaticOrderForWinner(Long auctionId);

    OrderDTOs.OrderResponse getOrderById(Long orderId);

    OrderDTOs.OrderResponse getOrderByAuctionId(Long auctionId);

    List<OrderDTOs.OrderResponse> getOrdersByBuyerId(Long buyerId);

    List<OrderDTOs.OrderResponse> getOrdersByBuyerEmail(String buyerEmail);

    List<OrderDTOs.OrderResponse> getAllOrders();

    OrderDTOs.OrderResponse updateOrderStatus(Long orderId, OrderStatus orderStatus);
}