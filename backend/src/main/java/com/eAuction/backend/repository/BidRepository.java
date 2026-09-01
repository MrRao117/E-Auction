package com.eAuction.backend.repository;

import com.eAuction.backend.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    long countByAuctionAuctionId(Long auctionId);

    // Fetch all bids for an auction, newest first
    List<Bid> findByAuctionAuctionIdOrderByBidTimeDesc(Long auctionId);

    Optional<Bid> findTopByAuctionAuctionIdOrderByBidAmountDesc(Long auctionId); // Finds current highest bid

    // Fetch all bids placed by a specific buyer
    List<Bid> findByBuyerUserIdOrderByBidTimeDesc(Long buyerId);
}