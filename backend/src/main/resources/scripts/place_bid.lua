-- KEYS[1]: Cache key (e.g., "auction:highest_bid:10")
-- ARGV[1]: New bid amount (e.g., "1500.00")
-- ARGV[2]: Bidder ID
-- ARGV[3]: Bidder Name
-- ARGV[4]: Current Timestamp (ms)
-- ARGV[5]: TTL in seconds (86400)
-- ARGV[6]: Auction End Time (ms) <-- NEW

local now = tonumber(ARGV[4])
local end_time = tonumber(ARGV[6])

-- 1. Strict End-Time Check
if end_time and now >= end_time then
    return cjson.encode({
        success = false,
        reason = "AUCTION_ENDED"
    })
end

local current_data = redis.call('GET', KEYS[1])

-- 2. Bid Amount Validation
if current_data then
    local cached = cjson.decode(current_data)
    local current_amount = tonumber(cached.amount)
    local new_amount = tonumber(ARGV[1])

    if new_amount <= current_amount then
        return cjson.encode({
            success = false,
            reason = "BID_TOO_LOW",
            currentAmount = current_amount
        })
    end
end

-- 3. Construct new JSON payload for BidCacheDTO
local new_payload = {
    auctionId = tonumber(string.match(KEYS[1], "%d+$")),
    bidderId = tonumber(ARGV[2]),
    bidderName = ARGV[3],
    amount = tonumber(ARGV[1]),
    timestamp = now
}

local encoded = cjson.encode(new_payload)

-- 4. Atomic update and TTL set
redis.call('SET', KEYS[1], encoded)
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5]))

return cjson.encode({
    success = true,
    data = new_payload
})