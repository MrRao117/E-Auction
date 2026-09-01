package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.enums.DeliveryStatus;

import java.util.List;

public interface DeliveryService {

    OrderDTOs.DeliveryResponse assignDelivery(OrderDTOs.AssignDeliveryRequest request);

    OrderDTOs.DeliveryResponse getDeliveryById(Long deliveryId);

    OrderDTOs.DeliveryResponse getDeliveryByOrderId(Long orderId);

    List<OrderDTOs.DeliveryResponse> getDeliveriesByAgentId(Long agentId);

    List<OrderDTOs.DeliveryResponse> getAllDeliveries();

    OrderDTOs.DeliveryResponse updateDeliveryStatus(Long deliveryId, DeliveryStatus status, String remarks);
}