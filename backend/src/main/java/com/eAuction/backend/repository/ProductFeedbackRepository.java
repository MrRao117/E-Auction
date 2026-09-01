package com.eAuction.backend.repository;

import com.eAuction.backend.entity.ProductFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFeedbackRepository extends JpaRepository<ProductFeedback, Long> {

    List<ProductFeedback> findByProduct_ProductId(Long productId);

    List<ProductFeedback> findByUser_UserId(Long userId);

    boolean existsByProduct_ProductIdAndUser_UserId(Long productId, Long userId);
}