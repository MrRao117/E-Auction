package com.eAuction.backend.controller;

import com.eAuction.backend.entity.DeliveryAgent;
import com.eAuction.backend.entity.enums.DeliveryAgentStatus;
import com.eAuction.backend.repository.DeliveryAgentRepository;
import com.eAuction.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/delivery-agents")
@RequiredArgsConstructor
public class DeliveryAgentController {

    private final DeliveryAgentRepository deliveryAgentRepository;

    @PostMapping
    public ResponseEntity<DeliveryAgent> createAgent(@Valid @RequestBody DeliveryAgent agent) {
        log.info("Creating new delivery agent: {}", agent.getName());
        DeliveryAgent savedAgent = deliveryAgentRepository.save(agent);
        return new ResponseEntity<>(savedAgent, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DeliveryAgent>> getAllAgents() {
        return ResponseEntity.ok(deliveryAgentRepository.findAll());
    }

    @GetMapping("/{agentId}")
    public ResponseEntity<DeliveryAgent> getAgentById(@PathVariable Long agentId) {
        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent not found with id: " + agentId));
        return ResponseEntity.ok(agent);
    }

    @PatchMapping("/{agentId}/status")
    public ResponseEntity<DeliveryAgent> updateAgentStatus(
            @PathVariable Long agentId,
            @RequestParam DeliveryAgentStatus status) {
        log.info("Updating agent ID: {} status to {}", agentId, status);
        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent not found with id: " + agentId));

        agent.setDeliveryStatus(status);
        return ResponseEntity.ok(deliveryAgentRepository.save(agent));
    }
}