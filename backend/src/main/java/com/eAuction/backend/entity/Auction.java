package com.eAuction.backend.entity;

import com.eAuction.backend.entity.enums.AuctionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "auction")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auctionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productId", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highestBidderId")
    private User highestBidder;

    private String title;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal currHighestBid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private AuctionStatus auctionStatus = AuctionStatus.SCHEDULED;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal bidIncrementedBy;

    @Version
    private Long version;

    public AuctionStatus getRealTimeStatus() {
        LocalDateTime now = LocalDateTime.now();
        if (this.auctionStatus == AuctionStatus.ACTIVE && now.isAfter(this.endTime)) {
            return AuctionStatus.ENDED;
        }
        if (this.auctionStatus == AuctionStatus.SCHEDULED && !now.isBefore(this.startTime)) {
            return AuctionStatus.ACTIVE;
        }
        return this.auctionStatus;
    }
}
