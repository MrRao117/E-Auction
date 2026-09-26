package com.eAuction.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminEmail;
    private String actionName;
    private String targetResource;
    private String status; // SUCCESS or FAILED

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}