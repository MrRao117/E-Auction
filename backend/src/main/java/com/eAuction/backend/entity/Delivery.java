package com.eAuction.backend.entity;


import com.eAuction.backend.entity.enums.DeliveryStatus;
import com.eAuction.backend.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "delivery")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderId", nullable = false)
    private AuctionOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agentId", nullable = false)
    private DeliveryAgent agent;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, name = "deliveryStatus")
    private DeliveryStatus deliveryStatus = DeliveryStatus.OUT_FOR_DELIVERY;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "assignedAt", updatable = false)
    private LocalDateTime assignedAt;
}
