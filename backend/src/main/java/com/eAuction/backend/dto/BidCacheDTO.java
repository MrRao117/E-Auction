package com.eAuction.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BidCacheDTO implements Serializable {
    private Long auctionId;
    private Long bidderId;
    private String bidderName;
    private BigDecimal amount;
    private Long timestamp;
}