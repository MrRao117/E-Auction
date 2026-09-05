package com.eAuction.backend.repository;

import com.eAuction.backend.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    // Fetch order history sorted from newest to oldest
    List<OrderStatusHistory> findByOrder_OrderIdOrderByCreatedAtDesc(Long orderId);
}