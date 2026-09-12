package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.Delivery;
import com.eAuction.backend.entity.DeliveryAgent;
import com.eAuction.backend.entity.enums.DeliveryAgentStatus;
import com.eAuction.backend.entity.enums.DeliveryStatus;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.DeliveryAgentRepository;
import com.eAuction.backend.repository.DeliveryRepository;
import com.eAuction.backend.repository.AuctionOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final AuctionOrderRepository orderRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final OrderStatusHistoryService historyService;

    @Override
    public OrderDTOs.DeliveryResponse assignDelivery(OrderDTOs.AssignDeliveryRequest request) {
        log.info("Assigning order ID: {} to delivery agent ID: {}", request.getOrderId(), request.getAgentId());

        // 1. Fetch and validate Order
        AuctionOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> {
                    log.warn("Delivery assignment failed. Order not found with ID: {}", request.getOrderId());
                    return new ResourceNotFoundException("Order not found with id: " + request.getOrderId());
                });

        // 2. Ensure Order is not cancelled
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            log.warn("Delivery assignment failed. Order ID {} is cancelled.", request.getOrderId());
            throw new InvalidOperationException("Cannot assign delivery for a cancelled order.");
        }

        // 3. Ensure a delivery assignment does not already exist for this order
        if (deliveryRepository.existsByOrder_OrderId(request.getOrderId())) {
            log.warn("Delivery assignment failed. Order ID {} already has an assigned delivery.", request.getOrderId());
            throw new InvalidOperationException("A delivery agent is already assigned to this order.");
        }

        // 4. Fetch and validate Delivery Agent
        DeliveryAgent agent = deliveryAgentRepository.findById(request.getAgentId())
                .orElseThrow(() -> {
                    log.warn("Delivery assignment failed. Agent not found with ID: {}", request.getAgentId());
                    return new ResourceNotFoundException("Delivery agent not found with id: " + request.getAgentId());
                });

        // 5. Ensure Agent is ACTIVE
        if (agent.getDeliveryStatus() != DeliveryAgentStatus.ACTIVE) {
            log.warn("Delivery assignment failed. Agent ID {} is in status {}", request.getAgentId(), agent.getDeliveryStatus());
            throw new InvalidOperationException("Cannot assign order to an INACTIVE or BUSY delivery agent.");
        }

        // 6. Build and save Delivery entity
        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setAgent(agent);
        delivery.setDeliveryStatus(DeliveryStatus.ASSIGNED);
        delivery.setRemarks(request.getRemarks());
        delivery.setAssignedAt(LocalDateTime.now());

        Delivery savedDelivery = deliveryRepository.save(delivery);

        // 7. Update Order status to SHIPPED or PROCESSING
        order.setOrderStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        log.info("Delivery ID {} successfully assigned to Agent ID {} for Order ID {}",
                savedDelivery.getDeliveryId(), agent.getAgentId(), order.getOrderId());
        historyService.logStatusChange(order, OrderStatus.SHIPPED.name());

        return mapToDeliveryResponse(savedDelivery);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.DeliveryResponse getDeliveryById(Long deliveryId) {
        log.info("Fetching delivery details for ID: {}", deliveryId);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found with id: " + deliveryId));

        return mapToDeliveryResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.DeliveryResponse getDeliveryByOrderId(Long orderId) {
        log.info("Fetching delivery details for order ID: {}", orderId);

        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        Delivery delivery = deliveryRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No delivery record found for order id: " + orderId));

        return mapToDeliveryResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTOs.DeliveryResponse> getDeliveriesByAgentId(Long agentId) {
        log.info("Fetching all deliveries assigned to agent ID: {}", agentId);

        if (!deliveryAgentRepository.existsById(agentId)) {
            throw new ResourceNotFoundException("Delivery agent not found with id: " + agentId);
        }

        return deliveryRepository.findByAgentAgentId(agentId).stream()
                .map(this::mapToDeliveryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTOs.DeliveryResponse> getAllDeliveries() {
        log.info("Fetching all delivery records");

        return deliveryRepository.findAll().stream()
                .map(this::mapToDeliveryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTOs.DeliveryResponse updateDeliveryStatus(Long deliveryId, DeliveryStatus status, String remarks) {
        log.info("Updating delivery status for delivery ID: {} to {}", deliveryId, status);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found with id: " + deliveryId));

        delivery.setDeliveryStatus(status);
        if (remarks != null && !remarks.isBlank()) {
            delivery.setRemarks(remarks);
        }

        // Sync order status upon final delivery completion
        if (status == DeliveryStatus.DELIVERED) {
            AuctionOrder order = delivery.getOrder();
            if (order != null) {
                order.setOrderStatus(OrderStatus.DELIVERED);
                orderRepository.save(order);

                historyService.logStatusChange(order, OrderStatus.DELIVERED.name());
            }
        }

        Delivery updatedDelivery = deliveryRepository.save(delivery);
        log.info("Delivery ID {} status successfully updated to {}", deliveryId, status);

        return mapToDeliveryResponse(updatedDelivery);
    }

    // Helper mapper from Entity to DTO
    private OrderDTOs.DeliveryResponse mapToDeliveryResponse(Delivery delivery) {
        OrderDTOs.DeliveryResponse response = new OrderDTOs.DeliveryResponse();
        response.setDeliveryId(delivery.getDeliveryId());
        response.setOrderId(delivery.getOrder() != null ? delivery.getOrder().getOrderId() : null);
        response.setAgentId(delivery.getAgent() != null ? delivery.getAgent().getAgentId() : null);
        response.setAgentName(delivery.getAgent() != null ? delivery.getAgent().getName() : null);
        response.setDeliveryStatus(delivery.getDeliveryStatus());
        response.setRemarks(delivery.getRemarks());
        response.setAssignedAt(delivery.getAssignedAt());
        return response;
    }
}