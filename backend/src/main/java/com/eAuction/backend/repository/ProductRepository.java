package com.eAuction.backend.repository;

import com.eAuction.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerUserId(Long sellerId);
    List<Product> findByIsVerifiedTrue();
    List<Product> findByIsVerifiedFalse(); // Useful for Admin verification queue

    List<Product> findByCategoryIdCategoryId(Long categoryId);
}