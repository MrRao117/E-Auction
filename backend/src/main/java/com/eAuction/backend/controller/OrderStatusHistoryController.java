package com.eAuction.backend.controller;

import com.eAuction.backend.dto.OrderStatusHistoryDTO;
import com.eAuction.backend.service.OrderStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class OrderStatusHistoryController {

    private final OrderStatusHistoryService historyService;

    @GetMapping("/{orderId}/history")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'ADMIN')")
    public ResponseEntity<List<OrderStatusHistoryDTO.HistoryResponse>> getOrderHistory(@PathVariable Long orderId) {
        return ResponseEntity.ok(historyService.getHistoryByOrderId(orderId));
    }
}