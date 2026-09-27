package com.eAuction.backend.controller;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    // BUYER DASHBOARD: View orders won by logged-in user
    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<List<OrderDTOs.OrderResponse>> getMyOrders(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(orderService.getOrdersByBuyerEmail(userEmail));
    }

    // BUYER / SELLER / ADMIN: View single order details with ownership check (IDOR protection)
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER', 'ADMIN')")
    public ResponseEntity<OrderDTOs.OrderResponse> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();

        // Check if the user has the ADMIN role
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        OrderDTOs.OrderResponse order = orderService.getOrderById(orderId);

        // If not an admin, verify that the current user owns or is associated with the order
        if (!isAdmin) {
            boolean isOwner = currentUserEmail.equalsIgnoreCase(order.getWinnerEmail());
            // If your order DTO also tracks a seller email, you can check that too:
            // || currentUserEmail.equalsIgnoreCase(order.getSellerEmail())

            if (!isOwner) {
                throw new AccessDeniedException("You do not have permission to view this order.");
            }
        }

        return ResponseEntity.ok(order);
    }

    // ADMIN ONLY: View all system orders
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTOs.OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ADMIN / DELIVERY AGENT: Advance status (CONFIRMED -> SHIPPED -> DELIVERED)
    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTOs.OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}