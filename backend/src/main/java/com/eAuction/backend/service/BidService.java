package com.eAuction.backend.service;

import com.eAuction.backend.dto.BidDTOs;

import java.util.List;

public interface BidService {

    BidDTOs.PublicBidResponse placeBid(Long auctionId, String buyerEmail, BidDTOs.PlaceBidRequest request);

    List<BidDTOs.PublicBidResponse> getBidsByAuctionId(Long auctionId);

    BidDTOs.PublicBidResponse getHighestBidForAuction(Long auctionId);

    List<BidDTOs.MyBidResponse> getBidsByBuyerEmail(String buyerEmail);

    List<BidDTOs.AdminBidResponse> getFullBidsForAdmin(Long auctionId);

    long getBidCountForAuction(Long auctionId);

    boolean isUserHighestBidder(Long auctionId, String userEmail);

}

