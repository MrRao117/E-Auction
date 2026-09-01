package com.eAuction.backend.service;

import com.eAuction.backend.dto.AuctionDTOs;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.AuctionRegistration;
import com.eAuction.backend.entity.AuctionRegistrationId;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionRegistrationRepository;
import com.eAuction.backend.repository.AuctionRepository;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuctionRegistrationServiceImpl implements AuctionRegistrationService {

    private final AuctionRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;

    @Override
    public void registerForAuction(Long auctionId, String userEmail) {
        log.info("Registering user email: {} for auction ID: {}", userEmail, auctionId);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        AuctionRegistrationId registrationId = new AuctionRegistrationId(user.getUserId(), auctionId);

        if (registrationRepository.existsById(registrationId)) {
            throw new DuplicateResourceException("User is already registered for this auction.");
        }

        if (auction.getProduct() != null
                && auction.getProduct().getSeller() != null
                && auction.getProduct().getSeller().getUserId().equals(user.getUserId())) {
            throw new InvalidOperationException("You cannot register for an auction created by yourself.");
        }

        AuctionRegistration registration = new AuctionRegistration();
        registration.setId(registrationId);
        registration.setUser(user);
        registration.setAuction(auction);

        registrationRepository.save(registration);
        log.info("User email: {} successfully registered for auction ID: {}", userEmail, auctionId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserRegisteredForAuction(String userEmail, Long auctionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return registrationRepository.existsById(new AuctionRegistrationId(user.getUserId(), auctionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionDTOs.AuctionResponse> getRegisteredAuctionsForUser(String userEmail) {
        log.info("Fetching registered auctions for user email: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return registrationRepository.findByUser_UserId(user.getUserId()).stream()
                .map(registration -> mapToAuctionResponse(registration.getAuction()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionDTOs.AuctionRegistrationDetailsResponse> getRegistrationsByAuctionId(Long auctionId) {
        log.info("Fetching registration list for auction ID: {}", auctionId);

        if (!auctionRepository.existsById(auctionId)) {
            throw new ResourceNotFoundException("Auction not found with id: " + auctionId);
        }

        return registrationRepository.findByAuctionAuctionId(auctionId).stream()
                .map(reg -> AuctionDTOs.AuctionRegistrationDetailsResponse.builder()
                        .userId(reg.getUser().getUserId())
                        .userName(reg.getUser().getName())
                        .userEmail(reg.getUser().getEmail())
                        .mobileNo(reg.getUser().getMobileNo())
                        .registeredAt(reg.getRegisteredAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getRegistrationCountForAuction(Long auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new ResourceNotFoundException("Auction not found with id: " + auctionId);
        }
        return registrationRepository.countByAuctionAuctionId(auctionId);
    }

    private AuctionDTOs.AuctionResponse mapToAuctionResponse(Auction auction) {
        return AuctionDTOs.AuctionResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProduct() != null ? auction.getProduct().getProductId() : null)
                .productTitle(auction.getProduct() != null ? auction.getProduct().getPname() : null)
                .title(auction.getTitle())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .currHighestBid(auction.getCurrHighestBid())
                .highestBidderId(auction.getHighestBidder() != null ? auction.getHighestBidder().getUserId() : null)
                .auctionStatus(auction.getAuctionStatus())
                .bidIncrementedBy(auction.getBidIncrementedBy())
                .build();
    }
}