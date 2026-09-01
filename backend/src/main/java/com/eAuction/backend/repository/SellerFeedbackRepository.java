package com.eAuction.backend.repository;

import com.eAuction.backend.entity.SellerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerFeedbackRepository extends JpaRepository<SellerFeedback, Long> {
    List<SellerFeedback> findBySellerUserId(Long sellerId);
}