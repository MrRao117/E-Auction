package com.eAuction.backend.controller;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.enums.DeliveryStatus;
import com.eAuction.backend.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/assign")
    public ResponseEntity<OrderDTOs.DeliveryResponse> assignDelivery(
            @Valid @RequestBody OrderDTOs.AssignDeliveryRequest request) {
        log.info("API request to assign order ID: {} to agent ID: {}", request.getOrderId(), request.getAgentId());
        OrderDTOs.DeliveryResponse response = deliveryService.assignDelivery(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTOs.DeliveryResponse>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }

    @GetMapping("/{deliveryId}")
    public ResponseEntity<OrderDTOs.DeliveryResponse> getDeliveryById(@PathVariable Long deliveryId) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(deliveryId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<OrderDTOs.DeliveryResponse> getDeliveryByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(deliveryService.getDeliveryByOrderId(orderId));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<OrderDTOs.DeliveryResponse>> getDeliveriesByAgentId(@PathVariable Long agentId) {
        return ResponseEntity.ok(deliveryService.getDeliveriesByAgentId(agentId));
    }

    @PatchMapping("/{deliveryId}/status")
    public ResponseEntity<OrderDTOs.DeliveryResponse> updateDeliveryStatus(
            @PathVariable Long deliveryId,
            @RequestParam DeliveryStatus status,
            @RequestParam(required = false) String remarks) {
        log.info("API request to update delivery ID: {} status to {}", deliveryId, status);
        OrderDTOs.DeliveryResponse response = deliveryService.updateDeliveryStatus(deliveryId, status, remarks);
        return ResponseEntity.ok(response);
    }
}