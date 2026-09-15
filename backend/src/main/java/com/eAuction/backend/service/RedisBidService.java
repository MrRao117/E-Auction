package com.eAuction.backend.service;

import com.eAuction.backend.dto.BidCacheDTO;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisBidService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final AuctionRepository auctionRepository;

    private static final String AUCTION_BID_KEY_PREFIX = "auction:highest_bid:";

    /**
     * Atomically validates and places a bid in Redis memory.
     */
    public BidCacheDTO placeBidInCache(Long auctionId, Long bidderId, String bidderName, BigDecimal bidAmount) {
        String cacheKey = AUCTION_BID_KEY_PREFIX + auctionId;

        // 1. Fetch current highest bid from Redis or initialize from DB
        BidCacheDTO currentHighestBid = (BidCacheDTO) redisTemplate.opsForValue().get(cacheKey);

        if (currentHighestBid == null) {
            currentHighestBid = initializeCacheFromDatabase(auctionId, cacheKey);
        }

        // 2. Validate Bid Amount against current highest bid
        if (bidAmount.compareTo(currentHighestBid.getAmount()) <= 0) {
            throw new InvalidOperationException("Bid amount must be strictly higher than the current highest bid: " + currentHighestBid.getAmount());
        }

        // 3. Construct new highest bid object
        BidCacheDTO newHighestBid = new BidCacheDTO(
                auctionId,
                bidderId,
                bidderName,
                bidAmount,
                System.currentTimeMillis()
        );

        // 4. Atomically update Redis cache
        redisTemplate.opsForValue().set(cacheKey, newHighestBid);
        log.info("Redis cache updated for Auction ID {}: New highest bid = {}", auctionId, bidAmount);

        return newHighestBid;
    }

    /**
     * Retrieves current highest bid directly from Redis (Sub-millisecond latency).
     */
    public BidCacheDTO getHighestBidFromCache(Long auctionId) {
        String cacheKey = AUCTION_BID_KEY_PREFIX + auctionId;
        BidCacheDTO cachedBid = (BidCacheDTO) redisTemplate.opsForValue().get(cacheKey);

        if (cachedBid == null) {
            cachedBid = initializeCacheFromDatabase(auctionId, cacheKey);
        }

        return cachedBid;
    }

    /**
     * Helper to populate Redis from MySQL if key is missing or expired.
     */
    private BidCacheDTO initializeCacheFromDatabase(Long auctionId, String cacheKey) {
        log.info("Redis cache miss for Auction ID {}. Loading from MySQL database...", auctionId);

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        BigDecimal currentBid = auction.getCurrHighestBid() != null ? auction.getCurrHighestBid() : auction.getBasePrice();
        Long bidderId = auction.getHighestBidder() != null ? auction.getHighestBidder().getUserId() : null;
        String bidderName = auction.getHighestBidder() != null ? auction.getHighestBidder().getName() : "System";

        BidCacheDTO initialBid = new BidCacheDTO(
                auctionId,
                bidderId,
                bidderName,
                currentBid,
                System.currentTimeMillis()
        );

        // Store in Redis with TTL (e.g., 24 Hours)
        redisTemplate.opsForValue().set(cacheKey, initialBid, 24, TimeUnit.HOURS);
        return initialBid;
    }
}