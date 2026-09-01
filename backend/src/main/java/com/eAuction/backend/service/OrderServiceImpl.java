package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderDTOs;
import com.eAuction.backend.entity.Address;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.entity.enums.AuctionStatus;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AddressRepository;
import com.eAuction.backend.repository.AuctionOrderRepository;
import com.eAuction.backend.repository.AuctionRepository;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final AuctionOrderRepository orderRepository;
    private final AuctionRepository auctionRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public OrderDTOs.OrderResponse createOrder(OrderDTOs.CreateOrderRequest request) {
        log.info("Creating order for auction ID: {} with address ID: {}", request.getAuctionId(), request.getAddressId());

        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + request.getAuctionId()));

        if (auction.getAuctionStatus() != AuctionStatus.ENDED) {
            throw new InvalidOperationException("Orders can only be created for completed or closed auctions.");
        }

        if (auction.getHighestBidder() == null) {
            throw new InvalidOperationException("Cannot create an order for an auction with no winning bidder.");
        }

        if (orderRepository.existsByAuction_AuctionId(request.getAuctionId())) {
            throw new InvalidOperationException("An order has already been created for this auction.");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));

        AuctionOrder order = new AuctionOrder();
        order.setAuction(auction);
        order.setAddress(address);
        order.setOrderStatus(OrderStatus.CREATED);

        AuctionOrder savedOrder = orderRepository.save(order);
        log.info("Order ID {} successfully created for auction ID {}", savedOrder.getOrderId(), request.getAuctionId());

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.OrderResponse getOrderById(Long orderId) {
        log.info("Fetching order with ID: {}", orderId);
        AuctionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTOs.OrderResponse getOrderByAuctionId(Long auctionId) {
        log.info("Fetching order for auction ID: {}", auctionId);
        AuctionOrder order = orderRepository.findByAuction_AuctionId(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for auction id: " + auctionId));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTOs.OrderResponse> getOrdersByBuyerEmail(String buyerEmail) {
        String normalizedEmail = buyerEmail.toLowerCase().trim();
        log.info("Fetching orders for buyer email: {}", normalizedEmail);

        User buyer = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with email: " + normalizedEmail));

        return orderRepository.findByAuction_HighestBidder_UserId(buyer.getUserId()).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTOs.OrderResponse> getOrdersByBuyerId(Long buyerId) {
        log.info("Fetching orders for buyer ID: {}", buyerId);
        return orderRepository.findByAuction_HighestBidder_UserId(buyerId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTOs.OrderResponse> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTOs.OrderResponse updateOrderStatus(Long orderId, OrderStatus orderStatus) {
        log.info("Updating order status for order ID: {} to {}", orderId, orderStatus);

        AuctionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setOrderStatus(orderStatus);
        AuctionOrder updatedOrder = orderRepository.save(order);

        log.info("Order ID {} status updated to {}", orderId, orderStatus);
        return mapToOrderResponse(updatedOrder);
    }

    /**
     * ORDER-SPECIFIC SCHEDULED TASK
     * Runs every hour: Automatically cancels CREATED orders if payment is not completed within 7 days.
     */
    @Scheduled(fixedRate = 3600000)
    public void processExpiredUnpaidOrders() {
        try {
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
            List<AuctionOrder> expiredOrders = orderRepository.findByOrderStatusAndOrderDateBefore(OrderStatus.CREATED, oneWeekAgo);

            for (AuctionOrder order : expiredOrders) {
                order.setOrderStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                log.info("Order ID: {} automatically CANCELLED due to non-payment within 1 week.", order.getOrderId());
            }
        } catch (Exception e) {
            log.error("Error processing expired unpaid orders", e);
        }
    }

    // Helper mapper from Entity to DTO
    private OrderDTOs.OrderResponse mapToOrderResponse(AuctionOrder order) {
        Auction auction = order.getAuction();
        User winner = auction != null ? auction.getHighestBidder() : null;
        Address address = order.getAddress();

        String formattedAddress = null;
        if (address != null) {
            StringBuilder sb = new StringBuilder();
            if (address.getHouseNo() != null && !address.getHouseNo().isBlank()) {
                sb.append(address.getHouseNo()).append(", ");
            }
            sb.append(address.getVillage_city()).append(", ")
                    .append(address.getDistrict()).append(", ")
                    .append(address.getState()).append(" - ")
                    .append(address.getPincode());

            formattedAddress = sb.toString();
        }

        return OrderDTOs.OrderResponse.builder()
                .orderId(order.getOrderId())
                .auctionId(auction != null ? auction.getAuctionId() : null)
                .auctionTitle(auction != null ? auction.getTitle() : null)
                .winnerName(winner != null ? winner.getName() : null)
                .winnerEmail(winner != null ? winner.getEmail() : null)
                .winningAmount(auction != null ? auction.getCurrHighestBid() : null)
                .shippingAddress(formattedAddress)
                .orderStatus(order.getOrderStatus())
                .orderDate(order.getOrderDate())
                .build();
    }
}