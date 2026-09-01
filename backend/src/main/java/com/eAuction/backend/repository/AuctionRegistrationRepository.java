package com.eAuction.backend.repository;

import com.eAuction.backend.entity.AuctionRegistration;
import com.eAuction.backend.entity.AuctionRegistrationId;
import org.checkerframework.checker.nullness.qual.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRegistrationRepository extends JpaRepository<AuctionRegistration, AuctionRegistrationId> {
    boolean existsById(@NonNull AuctionRegistrationId auctionRegistrationId);
    List<AuctionRegistration> findByAuctionAuctionId(Long auctionId);
    List<AuctionRegistration> findByUser_UserId(Long userId);

    long countByAuctionAuctionId(Long auctionId);
}