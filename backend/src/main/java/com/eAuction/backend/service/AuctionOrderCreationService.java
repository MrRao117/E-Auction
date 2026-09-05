package com.eAuction.backend.service;

import com.eAuction.backend.entity.Address;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.OrderStatusHistory;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AddressRepository;
import com.eAuction.backend.repository.AuctionOrderRepository;
import com.eAuction.backend.repository.AuctionRepository;
import com.eAuction.backend.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionOrderCreationService {

    private final AuctionOrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final AuctionRepository auctionRepository;
    private final OrderStatusHistoryRepository historyRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createOrderForWinner(Long auctionId) {
        // Fetch fresh managed auction entity inside this new transaction
        Auction auction = auctionRepository.findById(auctionId).orElse(null);

        if (auction == null) {
            log.warn("Order creation aborted: Auction ID {} not found.", auctionId);
            return;
        }

        if (auction.getHighestBidder() == null) {
            log.info("Auction ID: {} ended with no bids. No order created.", auctionId);
            return;
        }

        if (orderRepository.existsByAuction_AuctionId(auctionId)) {
            log.info("Order already exists for Auction ID: {}", auctionId);
            return;
        }

        Long winnerUserId = auction.getHighestBidder().getUserId();

        // Fallback search strategy for winner's shipping address
        Address shippingAddress = addressRepository.findByUserUserIdAndIsDefaultTrue(winnerUserId)
                .orElseGet(() -> addressRepository.findFirstByUserUserIdOrderByAddressIdAsc(winnerUserId)
                        .orElseThrow(() -> new ResourceNotFoundException("NO_ADDRESS_FOUND")));

        AuctionOrder order = new AuctionOrder();
        order.setAuction(auction);
        order.setAddress(shippingAddress);
        order.setOrderStatus(OrderStatus.CREATED);

        orderRepository.saveAndFlush(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(OrderStatus.CREATED.name());
        historyRepository.save(history);

        log.info("SUCCESS: AuctionOrder automatically created with ID: {} for Auction ID: {}", order.getOrderId(), auctionId);
    }
}