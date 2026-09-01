package com.eAuction.backend.repository;

import com.eAuction.backend.entity.DeliveryAgent;
import com.eAuction.backend.entity.enums.DeliveryAgentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

    List<DeliveryAgent> findByDeliveryStatus(DeliveryAgentStatus status);

    boolean existsByPhoneNo(String phoneNo);
}