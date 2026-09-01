package com.eAuction.backend.repository;

import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.entity.enums.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByAuctionStatus(AuctionStatus status);
    List<Auction> findByProductSellerUserId(Long sellerId);
    boolean existsByProductProductIdAndAuctionStatusIn(Long productId, List<AuctionStatus> statuses);

    List<Auction> findByAuctionStatusAndStartTimeBefore(AuctionStatus auctionStatus, LocalDateTime now);

    List<Auction> findByAuctionStatusAndEndTimeBefore(AuctionStatus auctionStatus, LocalDateTime now);

    List<Auction> findByProduct_Seller_UserId(Long userId);
}