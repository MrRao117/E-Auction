package com.eAuction.backend.service;

import com.eAuction.backend.dto.AuctionDTOs;
import com.eAuction.backend.entity.enums.AuctionStatus;

import java.util.List;

public interface AuctionService {

    AuctionDTOs.AuctionResponse createAuction(AuctionDTOs.CreateAuctionRequest request, String sellerEmail);

    List<AuctionDTOs.AuctionResponse> getAuctionsForLoggedInSeller(String sellerEmail);

    AuctionDTOs.AuctionResponse getAuctionById(Long auctionId);

    List<AuctionDTOs.AuctionResponse> getAllAuctions();

    List<AuctionDTOs.AuctionResponse> getAuctionsByStatus(AuctionStatus status);

    List<AuctionDTOs.AuctionResponse> getAuctionsBySellerEmailForAdmin(String sellerEmail);

    AuctionDTOs.AuctionResponse updateAuctionStatus(Long auctionId, AuctionStatus newStatus);

    void cancelAuction(Long auctionId);
}