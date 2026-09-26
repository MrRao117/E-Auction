package com.eAuction.backend.repository;

import com.eAuction.backend.entity.Delivery;
import com.eAuction.backend.entity.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrder_OrderId(Long orderId);

    List<Delivery> findByAgent_AgentId(Long agentId);

    List<Delivery> findByDeliveryStatus(DeliveryStatus deliveryStatus);

    boolean existsByOrder_OrderId(Long orderId);
}