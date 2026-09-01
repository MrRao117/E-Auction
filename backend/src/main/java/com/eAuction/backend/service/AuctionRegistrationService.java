package com.eAuction.backend.service;

import com.eAuction.backend.dto.AuctionDTOs;

import java.util.List;

public interface AuctionRegistrationService {

    void registerForAuction(Long auctionId, String userEmail);

    boolean isUserRegisteredForAuction(String userEmail, Long auctionId);

    List<AuctionDTOs.AuctionResponse> getRegisteredAuctionsForUser(String userEmail);

    List<AuctionDTOs.AuctionRegistrationDetailsResponse> getRegistrationsByAuctionId(Long auctionId);

    long getRegistrationCountForAuction(Long auctionId);
}