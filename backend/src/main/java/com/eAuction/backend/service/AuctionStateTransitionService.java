package com.eAuction.backend.service;

import com.eAuction.backend.entity.Address;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.enums.AuctionStatus;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.repository.AddressRepository;
import com.eAuction.backend.repository.AuctionOrderRepository;
import com.eAuction.backend.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionStateTransitionService {

    private final AuctionRepository auctionRepository;
    private final AuctionOrderRepository orderRepository;
    private final AddressRepository addressRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void activateAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null || auction.getAuctionStatus() != AuctionStatus.SCHEDULED) {
            return;
        }

        auction.setAuctionStatus(AuctionStatus.ACTIVE);
        auctionRepository.saveAndFlush(auction);
        log.info("Auction ID: {} status automatically updated to ACTIVE", auctionId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void endAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null || auction.getAuctionStatus() != AuctionStatus.ACTIVE) return;

        auction.setAuctionStatus(AuctionStatus.ENDED);
        auctionRepository.saveAndFlush(auction);
        log.info("Auction ID: {} status automatically updated to ENDED", auctionId);

        // Auto-create order if a winner exists and no order was generated yet
        if (auction.getHighestBidder() != null && !orderRepository.existsByAuction_AuctionId(auctionId)) {
            Long winnerUserId = auction.getHighestBidder().getUserId();

            // 1. Fetch default address, or fallback to first available address
            Address shippingAddress = addressRepository.findByUserUserIdAndIsDefaultTrue(winnerUserId)
                    .orElseGet(() -> addressRepository.findFirstByUserUserIdOrderByAddressIdAsc(winnerUserId).orElse(null));

            if (shippingAddress == null) {
                log.warn("Auction ID: {} ended with winner ID: {}, but no address was found. Order creation postponed.",
                        auctionId, winnerUserId);
                return;
            }

            // 2. Create AuctionOrder with assigned default address
            AuctionOrder order = new AuctionOrder();
            order.setAuction(auction);
            order.setAddress(shippingAddress);
            order.setOrderStatus(OrderStatus.CREATED);

            orderRepository.saveAndFlush(order);
            log.info("AuctionOrder automatically created for Auction ID: {} with Address ID: {}", auctionId, shippingAddress.getAddressId());
        }
    }
}