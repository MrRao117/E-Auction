package com.backend.repository;

import com.eAuction.backend.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface AdminAnalyticsRepository extends JpaRepository<Auction, Long> {

    @Query(value = "SELECT DATE(created_at) as period, SUM(final_price) as revenue " +
            "FROM auction WHERE auction_status = 'CLOSED' " +
            "GROUP BY DATE(created_at) ORDER BY period DESC LIMIT 30", nativeQuery = true)
    List<Map<String, Object>> getRevenueOverTime();

    @Query(value = "SELECT auction_status, COUNT(*) as count FROM auction GROUP BY auction_status", nativeQuery = true)
    List<Map<String, Object>> getAuctionStatusCounts();

    @Query(value = "SELECT HOUR(created_at) as bid_hour, COUNT(*) as total_bids " +
            "FROM bid GROUP BY HOUR(created_at) ORDER BY bid_hour ASC", nativeQuery = true)
    List<Map<String, Object>> getBidsPerHour();

    @Query(value = "SELECT u.username, COUNT(a.id) as total_auctions, SUM(a.final_price) as total_revenue " +
            "FROM users u JOIN auction a ON u.id = a.seller_id " +
            "GROUP BY u.id, u.username ORDER BY total_revenue DESC LIMIT 5", nativeQuery = true)
    List<Map<String, Object>> getTopSellers();

    @Query(value = "SELECT kyc_status, COUNT(*) as count FROM users GROUP BY kyc_status", nativeQuery = true)
    List<Map<String, Object>> getKycFunnel();

    @Query(value = "SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status", nativeQuery = true)
    List<Map<String, Object>> getOrderStatusBreakdown();

    @Query(value = "SELECT " +
            "  (SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) * 100.0) / COUNT(*) as failure_rate " +
            "FROM payment", nativeQuery = true)
    Double getPaymentFailureRate();
}