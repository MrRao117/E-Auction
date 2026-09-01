package com.eAuction.backend.service;

import com.eAuction.backend.dto.AuctionDTOs;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.Product;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.entity.enums.AuctionStatus;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionRepository;
import com.eAuction.backend.repository.ProductRepository;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionStateTransitionService transitionService;

    @Override
    public AuctionDTOs.AuctionResponse createAuction(AuctionDTOs.CreateAuctionRequest request, String sellerEmail) {
        log.info("Creating auction for product ID: {} by seller: {}", request.getProductId(), sellerEmail);

        if (request.getEndTime().isBefore(request.getStartTime())) {
            log.warn("Auction creation failed. End time {} is before start time {}", request.getEndTime(), request.getStartTime());
            throw new InvalidOperationException("End time must be after the start time.");
        }

        User loggedInSeller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with email: " + sellerEmail));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> {
                    log.warn("Auction creation failed. Product not found with ID: {}", request.getProductId());
                    return new ResourceNotFoundException("Product not found with id: " + request.getProductId());
                });

        // OWNERSHIP CHECK: Ensure the logged-in seller owns this product
        if (product.getSeller() == null || !product.getSeller().getUserId().equals(loggedInSeller.getUserId())) {
            throw new InvalidOperationException("You are not authorized to create an auction for this product.");
        }

        if (!product.isVerified()) {
            log.warn("Auction creation failed. Product ID {} is not verified.", request.getProductId());
            throw new InvalidOperationException("Cannot create an auction for an unverified product.");
        }

        // Check if the product already has an active or scheduled auction
        boolean activeAuctionExists = auctionRepository.existsByProductProductIdAndAuctionStatusIn(
                request.getProductId(),
                List.of(AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE)
        );
        if (activeAuctionExists) {
            log.warn("Auction creation failed. Product ID {} already has an active/scheduled auction.", request.getProductId());
            throw new InvalidOperationException("An active or scheduled auction already exists for this product.");
        }

        BigDecimal basePrice = product.getBasePrice();

        Auction auction = new Auction();
        auction.setProduct(product);
        auction.setTitle(request.getTitle() != null && !request.getTitle().isBlank()
                ? request.getTitle()
                : product.getPname());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setBidIncrementedBy(request.getBidIncrementedBy());
        auction.setBasePrice(basePrice);
        auction.setCurrHighestBid(basePrice);

        LocalDateTime now = LocalDateTime.now();
        if (request.getStartTime().isAfter(now)) {
            auction.setAuctionStatus(AuctionStatus.SCHEDULED);
        } else {
            auction.setAuctionStatus(AuctionStatus.ACTIVE);
        }

        Auction savedAuction = auctionRepository.save(auction);
        log.info("Auction created successfully with ID: {}", savedAuction.getAuctionId());

        return mapToAuctionResponse(savedAuction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionDTOs.AuctionResponse> getAuctionsForLoggedInSeller(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with email: " + sellerEmail));

        return auctionRepository.findByProductSellerUserId(seller.getUserId())
                .stream()
                .map(this::mapToAuctionResponse)
                .toList();
    }

    /**
     * Scheduled Task: Transitions SCHEDULED -> ACTIVE when start time arrives
     */
    @Scheduled(fixedRate = 5000)
    public void processScheduledToActiveAuctions() {
        List<Auction> scheduledAuctions = auctionRepository
                .findByAuctionStatusAndStartTimeBefore(AuctionStatus.SCHEDULED, LocalDateTime.now());

        for (Auction auction : scheduledAuctions) {
            try {
                transitionService.activateAuction(auction.getAuctionId());
            } catch (Exception e) {
                log.error("Error activating auction ID {}: {}", auction.getAuctionId(), e.getMessage());
            }
        }
    }

    /**
     * Scheduled Task: Transitions ACTIVE -> ENDED when end time passes
     */
    @Scheduled(fixedRate = 5000)
    public void processActiveToEndedAuctions() {
        List<Auction> activeAuctions = auctionRepository
                .findByAuctionStatusAndEndTimeBefore(AuctionStatus.ACTIVE, LocalDateTime.now());

        for (Auction auction : activeAuctions) {
            try {
                transitionService.endAuction(auction.getAuctionId());
            } catch (Exception e) {
                log.error("Error ending auction ID {}: {}", auction.getAuctionId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuctionDTOs.AuctionResponse getAuctionById(Long auctionId) {
        log.info("Fetching auction with ID: {}", auctionId);

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> {
                    log.warn("Auction not found with ID: {}", auctionId);
                    return new ResourceNotFoundException("Auction not found with id: " + auctionId);
                });

        return mapToAuctionResponse(auction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionDTOs.AuctionResponse> getAllAuctions() {
        log.info("Fetching all auctions");

        return auctionRepository.findAll().stream()
                .map(this::mapToAuctionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionDTOs.AuctionResponse> getAuctionsByStatus(AuctionStatus status) {
        log.info("Fetching auctions with status: {}", status);

        return auctionRepository.findByAuctionStatus(status).stream()
                .map(this::mapToAuctionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionDTOs.AuctionResponse> getAuctionsBySellerEmailForAdmin(String sellerEmail) {
        String normalizedEmail = sellerEmail.toLowerCase().trim();

        User seller = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with email: " + normalizedEmail));

        return auctionRepository.findByProduct_Seller_UserId(seller.getUserId()).stream()
                .map(this::mapToAuctionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AuctionDTOs.AuctionResponse updateAuctionStatus(Long auctionId, AuctionStatus newStatus) {
        log.info("Updating status for auction ID: {} to {}", auctionId, newStatus);

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        auction.setAuctionStatus(newStatus);
        Auction updatedAuction = auctionRepository.save(auction);

        log.info("Auction ID: {} status updated to {}", auctionId, updatedAuction.getAuctionStatus());
        return mapToAuctionResponse(updatedAuction);
    }

    @Override
    public void cancelAuction(Long auctionId) {
        log.info("Cancelling auction ID: {}", auctionId);

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        if (auction.getHighestBidder() != null) {
            log.warn("Cannot cancel auction ID: {} as bids have already been placed.", auctionId);
            throw new InvalidOperationException("Cannot cancel an auction that already has active bids.");
        }

        auction.setAuctionStatus(AuctionStatus.CANCELLED);
        auctionRepository.save(auction);
        log.info("Auction ID: {} cancelled successfully", auctionId);
    }

    private AuctionDTOs.AuctionResponse mapToAuctionResponse(Auction auction) {
        return AuctionDTOs.AuctionResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProduct() != null ? auction.getProduct().getProductId() : null)
                .productTitle(auction.getProduct() != null ? auction.getProduct().getPname() : null)
                .title(auction.getTitle())
                .basePrice(auction.getBasePrice())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .currHighestBid(auction.getCurrHighestBid())
                .highestBidderId(auction.getHighestBidder() != null ? auction.getHighestBidder().getUserId() : null)
                .auctionStatus(auction.getRealTimeStatus())
                .bidIncrementedBy(auction.getBidIncrementedBy())
                .build();
    }
}