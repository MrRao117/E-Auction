package com.eAuction.backend.service;

import com.eAuction.backend.dto.BidCacheDTO;
import com.eAuction.backend.entity.Auction;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AuctionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisBidService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final AuctionRepository auctionRepository;
    private final RedisScript<String> placeBidScript;
    private final ObjectMapper objectMapper;

    private static final String AUCTION_BID_KEY_PREFIX = "auction:highest_bid:";

    /**
     * Atomically validates and places a bid in Redis memory using Lua script execution
     * with strict auction end-time validation.
     */
    public BidCacheDTO placeBidInCache(Long auctionId, Long bidderId, String bidderName, BigDecimal bidAmount, long endTimeMillis) {
        String cacheKey = AUCTION_BID_KEY_PREFIX + auctionId;

        // Ensure key is initialized in cache before Lua execution
        if (Boolean.FALSE.equals(redisTemplate.hasKey(cacheKey))) {
            initializeCacheFromDatabase(auctionId, cacheKey);
        }

        try {
            // Execute Lua script for atomic check-and-set operation
            String rawResult = stringRedisTemplate.execute(
                    placeBidScript,
                    Collections.singletonList(cacheKey),
                    bidAmount.toPlainString(),
                    String.valueOf(bidderId),
                    bidderName != null ? bidderName : "Anonymous",
                    String.valueOf(System.currentTimeMillis()),
                    "86400", // 24-hour TTL in seconds
                    String.valueOf(endTimeMillis) // ARGV[6]: Strict End-Time Check
            );

            if (rawResult == null) {
                throw new InvalidOperationException("Failed to process atomic bid check in cache.");
            }

            JsonNode jsonNode = objectMapper.readTree(rawResult);
            boolean success = jsonNode.path("success").asBoolean(false);

            if (!success) {
                String reason = jsonNode.path("reason").asText("");

                if ("AUCTION_ENDED".equalsIgnoreCase(reason)) {
                    log.warn("Atomic Redis bid rejected for Auction ID {}: Auction has already ended.", auctionId);
                    throw new InvalidOperationException("This auction has already ended.");
                }

                double currentAmount = jsonNode.path("currentAmount").asDouble();
                log.warn("Atomic Redis bid rejected for Auction ID {}. Attempted: {}, Current: {}", auctionId, bidAmount, currentAmount);
                throw new InvalidOperationException("Bid amount must be strictly higher than the current highest bid: " + currentAmount);
            }

            JsonNode dataNode = jsonNode.path("data");
            BidCacheDTO newHighestBid = new BidCacheDTO(
                    auctionId,
                    bidderId,
                    bidderName,
                    bidAmount,
                    dataNode.path("timestamp").asLong()
            );

            log.info("Redis cache atomically updated for Auction ID {}: New highest bid = {}", auctionId, bidAmount);
            return newHighestBid;

        } catch (InvalidOperationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error executing atomic Lua bid script for auction ID {}", auctionId, e);
            throw new InvalidOperationException("Could not place bid due to a concurrent conflict. Please retry.");
        }
    }

    /**
     * Retrieves current highest bid directly from Redis (Sub-millisecond latency).
     */
    public BidCacheDTO getHighestBidFromCache(Long auctionId) {
        String cacheKey = AUCTION_BID_KEY_PREFIX + auctionId;
        Object rawCached = redisTemplate.opsForValue().get(cacheKey);

        BidCacheDTO cachedBid = null;
        if (rawCached != null) {
            try {
                if (rawCached instanceof BidCacheDTO) {
                    cachedBid = (BidCacheDTO) rawCached;
                } else if (rawCached instanceof String) {
                    cachedBid = objectMapper.readValue((String) rawCached, BidCacheDTO.class);
                } else {
                    cachedBid = objectMapper.convertValue(rawCached, BidCacheDTO.class);
                }
            } catch (Exception e) {
                log.warn("Failed to deserialize cached bid for auction ID: {}. Re-initializing from DB...", auctionId);
            }
        }

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
                currentBid != null ? currentBid : BigDecimal.ZERO,
                System.currentTimeMillis()
        );

        // Store in Redis with TTL (24 Hours)
        try {
            String jsonPayload = objectMapper.writeValueAsString(initialBid);
            stringRedisTemplate.opsForValue().set(cacheKey, jsonPayload, 24, TimeUnit.HOURS);
        } catch (Exception e) {
            redisTemplate.opsForValue().set(cacheKey, initialBid, 24, TimeUnit.HOURS);
        }

        return initialBid;
    }
}