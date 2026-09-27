package com.eAuction.backend.service;

import com.eAuction.backend.dto.BidDTOs;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.AuctionRegistrationId;
import com.eAuction.backend.entity.Bid;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.entity.enums.AuctionStatus;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionRegistrationRepository;
import com.eAuction.backend.repository.AuctionRepository;
import com.eAuction.backend.repository.BidRepository;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final RedisBidService redisBidService;
    private final BidAsyncEventExecutor bidAsyncEventExecutor;

    // Injected business-aware rate limiter
    private final AuctionBidRateLimiter auctionBidRateLimiter;

    @Override
    @Transactional
    public BidDTOs.PublicBidResponse placeBid(Long auctionId, String buyerEmail, BidDTOs.PlaceBidRequest request) {
        BidDTOs.PublicBidResponse publicResponse;
        Long buyerId;

        try {
            // 1. Fetch Auction & Validate Status
            Auction auction = auctionRepository.findById(auctionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

            AuctionStatus currentStatus = auction.getRealTimeStatus();

            if (currentStatus == AuctionStatus.CANCELLED) {
                throw new InvalidOperationException("This auction has been cancelled.");
            }
            if (currentStatus == AuctionStatus.ENDED) {
                throw new InvalidOperationException("This auction has already ended.");
            }
            if (currentStatus == AuctionStatus.SCHEDULED) {
                throw new InvalidOperationException("This auction has not started yet.");
            }
            if (currentStatus != AuctionStatus.ACTIVE) {
                throw new InvalidOperationException("Bidding is not allowed for an auction in status: " + currentStatus);
            }

            // 2. Fetch Buyer
            User buyer = userRepository.findByEmail(buyerEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + buyerEmail));
            buyerId = buyer.getUserId();

            // --- 3. IN-APP BUSINESS-AWARE RATE LIMIT CHECK ---
            if (!auctionBidRateLimiter.tryConsumeBid(buyerId, auctionId)) {
                throw new InvalidOperationException("You are bidding too fast on this auction. Please wait a few seconds before trying again.");
            }

            // Prevent seller from bidding on their own listing
            if (auction.getProduct() != null && auction.getProduct().getSeller() != null
                    && auction.getProduct().getSeller().getEmail().equalsIgnoreCase(buyerEmail)) {
                throw new InvalidOperationException("Sellers are not permitted to bid on their own listings.");
            }

            // 4. Check Registration
            boolean isRegistered = auctionRegistrationRepository.existsById(
                    new AuctionRegistrationId(buyer.getUserId(), auctionId)
            );
            if (!isRegistered) {
                throw new InvalidOperationException("You must register for this auction prior to placing a bid.");
            }

            // 5. Calculate Minimum Required Bid Logic
            BigDecimal incrementStep = auction.getBidIncrementedBy() != null ? auction.getBidIncrementedBy() : BigDecimal.ZERO;
            BigDecimal currentBid = auction.getCurrHighestBid() != null ? auction.getCurrHighestBid() : BigDecimal.ZERO;

            BigDecimal minRequiredBid;
            if (bidRepository.countByAuctionAuctionId(auctionId) == 0) {
                minRequiredBid = auction.getBasePrice() != null ? auction.getBasePrice() : BigDecimal.ZERO;
            } else {
                minRequiredBid = currentBid.add(incrementStep);
            }

            if (request.getBidAmount().compareTo(minRequiredBid) < 0) {
                throw new InvalidOperationException("Bid amount must be at least " + minRequiredBid);
            }

            // Convert End Time to Epoch Milliseconds for strict Lua check
            long endTimeMillis = auction.getEndTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            // --- 6. ATOMIC REDIS LUA CACHE EXECUTION ---
            redisBidService.placeBidInCache(
                    auctionId,
                    buyer.getUserId(),
                    buyer.getName(),
                    request.getBidAmount(),
                    endTimeMillis
            );

            // 7. Save Entity to Database
            Bid bid = new Bid();
            bid.setAuction(auction);
            bid.setBuyer(buyer);
            bid.setBidAmount(request.getBidAmount());

            Bid savedBid = bidRepository.save(bid);

            auction.setCurrHighestBid(request.getBidAmount());
            auction.setHighestBidder(buyer);
            auctionRepository.save(auction);

            publicResponse = mapToPublicBidResponse(savedBid);

        } catch (ObjectOptimisticLockingFailureException e) {
            log.warn("Concurrent bid conflict for auction ID: {}", auctionId);
            throw new InvalidOperationException("Another bid was placed simultaneously. Please refresh and try again.");
        }

        // 8. Async Side Effects
        bidAsyncEventExecutor.publishBidSideEffects(auctionId, buyerId, request.getBidAmount(), publicResponse);

        return publicResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidDTOs.PublicBidResponse> getBidsByAuctionId(Long auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new ResourceNotFoundException("Auction not found with id: " + auctionId);
        }

        return bidRepository.findByAuctionAuctionIdOrderByBidTimeDesc(auctionId).stream()
                .map(this::mapToPublicBidResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BidDTOs.PublicBidResponse getHighestBidForAuction(Long auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new ResourceNotFoundException("Auction not found with id: " + auctionId);
        }

        Bid highestBid = bidRepository.findTopByAuctionAuctionIdOrderByBidAmountDesc(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("No bids have been placed for auction id: " + auctionId));

        return mapToPublicBidResponse(highestBid);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidDTOs.MyBidResponse> getBidsByBuyerEmail(String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + buyerEmail));

        return bidRepository.findByBuyerUserIdOrderByBidTimeDesc(buyer.getUserId()).stream()
                .map(this::mapToMyBidResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidDTOs.AdminBidResponse> getFullBidsForAdmin(Long auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new ResourceNotFoundException("Resource not found with auction id: " + auctionId);
        }
        return bidRepository.findByAuctionAuctionIdOrderByBidTimeDesc(auctionId).stream()
                .map(bid -> BidDTOs.AdminBidResponse.builder()
                        .bidId(bid.getBidId())
                        .buyerId(bid.getBuyer().getUserId())
                        .buyerEmail(bid.getBuyer().getEmail())
                        .buyerName(bid.getBuyer().getName())
                        .bidAmount(bid.getBidAmount())
                        .bidTime(bid.getBidTime())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getBidCountForAuction(Long auctionId) {
        return bidRepository.countByAuctionAuctionId(auctionId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserHighestBidder(Long auctionId, String userEmail) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        return auction.getHighestBidder() != null
                && auction.getHighestBidder().getEmail().equalsIgnoreCase(userEmail);
    }

    private BidDTOs.PublicBidResponse mapToPublicBidResponse(Bid bid) {
        String rawName = (bid.getBuyer() != null && bid.getBuyer().getName() != null)
                ? bid.getBuyer().getName()
                : "Anonymous";

        return BidDTOs.PublicBidResponse.builder()
                .bidderAlias(maskName(rawName))
                .bidAmount(bid.getBidAmount())
                .bidTime(bid.getBidTime())
                .build();
    }

    private BidDTOs.MyBidResponse mapToMyBidResponse(Bid bid) {
        return BidDTOs.MyBidResponse.builder()
                .bidAmount(bid.getBidAmount())
                .bidTime(bid.getBidTime())
                .build();
    }

    private String maskName(String name) {
        if (name == null || name.length() <= 2) {
            return "***";
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1);
    }
}