package com.eAuction.backend.entity;

import com.eAuction.backend.entity.enums.DeliveryAgentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "delivery_agent")
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long agentId;

    @Column(length = 100)
    private String name;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile number must be a valid 10-digit Indian number starting with 6-9")
    private String phoneNo;

    @Column(length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    private DeliveryAgentStatus deliveryStatus = DeliveryAgentStatus.ACTIVE;
}
