package com.eAuction.backend.repository;

import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionOrderRepository extends JpaRepository<AuctionOrder, Long> {

    Optional<AuctionOrder> findByAuction_AuctionId(Long auctionId);

    boolean existsByAuction_AuctionId(Long auctionId);

    List<AuctionOrder> findByAuction_HighestBidder_UserId(Long buyerId);

    List<AuctionOrder> findByOrderStatus(OrderStatus orderStatus);

    List<AuctionOrder> findByOrderStatusAndOrderDateBefore(OrderStatus orderStatus, LocalDateTime cutOffTime);
}