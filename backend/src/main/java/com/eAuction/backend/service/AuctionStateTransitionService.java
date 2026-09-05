package com.eAuction.backend.service;

import com.eAuction.backend.entity.Address;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.enums.AuctionStatus;
import com.eAuction.backend.entity.enums.OrderStatus;
import com.eAuction.backend.exception.ResourceNotFoundException;
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
    private final AuctionOrderCreationService auctionOrderCreationService;

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

        // 1. Transaction 1: Mark as ENDED and commit to DB
        auction.setAuctionStatus(AuctionStatus.ENDED);
        auctionRepository.saveAndFlush(auction);
        log.info("Auction ID: {} status automatically updated to ENDED in DB", auctionId);

        // 2. Transaction 2: Execute order creation in an isolated sub-transaction
        try {
            // Pass auction.getAuctionId() instead of auction object
            auctionOrderCreationService.createOrderForWinner(auction.getAuctionId());
        } catch (ResourceNotFoundException e) {
            if ("NO_ADDRESS_FOUND".equals(e.getMessage())) {
                log.warn("Auction ID {} set to ENDED, but winner has no registered shipping address. Order creation postponed.", auctionId);
            } else {
                log.error("Resource error during auto order creation for Auction ID {}: {}", auctionId, e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to auto-create order for ended Auction ID {}: {}", auctionId, e.getMessage());
        }
    }


}