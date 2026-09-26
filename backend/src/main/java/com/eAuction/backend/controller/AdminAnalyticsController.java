package com.eAuction.backend.controller;

import com.backend.repository.AdminAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminAnalyticsController {

    @Autowired
    private AdminAnalyticsRepository analyticsRepository;

    @Cacheable(value = "adminAnalyticsCache", key = "'dashboardMetrics'")
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> metrics = new HashMap<>();

        metrics.put("revenueOverTime", analyticsRepository.getRevenueOverTime());
        metrics.put("auctionStatusCounts", analyticsRepository.getAuctionStatusCounts());
        metrics.put("bidsPerHour", analyticsRepository.getBidsPerHour());
        metrics.put("topSellers", analyticsRepository.getTopSellers());
        metrics.put("kycFunnel", analyticsRepository.getKycFunnel());
        metrics.put("orderStatusBreakdown", analyticsRepository.getOrderStatusBreakdown());
        metrics.put("paymentFailureRate", analyticsRepository.getPaymentFailureRate());

        return ResponseEntity.ok(metrics);
    }
}
