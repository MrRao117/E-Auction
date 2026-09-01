package com.eAuction.backend.controller;

import com.eAuction.backend.dto.MiscDTOs;
import com.eAuction.backend.entity.enums.VerificationStatus;
import com.eAuction.backend.service.MiscService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kyc")
@RequiredArgsConstructor
public class KycController {

    private final MiscService miscService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<MiscDTOs.KycResponse> submitKyc(
            @Valid @RequestBody MiscDTOs.KycSubmissionRequest request,
            Authentication authentication
    ) {
        MiscDTOs.KycResponse response = miscService.submitKyc(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-status")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<MiscDTOs.KycResponse> getMyKycStatus(Authentication authentication) {
        MiscDTOs.KycResponse response = miscService.getKycByUserEmail(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MiscDTOs.KycResponse>> getKycByStatus(
            @RequestParam(defaultValue = "PENDING") VerificationStatus status
    ) {
        List<MiscDTOs.KycResponse> responses = miscService.getKycsByStatus(status);
        return ResponseEntity.ok(responses);
    }

    // Fetch complete KYC history for any user by email (Admin view)
    @GetMapping("/admin/user-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MiscDTOs.KycResponse>> getAllKycsByUserEmail(@RequestParam String email) {
        List<MiscDTOs.KycResponse> responses = miscService.getAllKycsByUserEmail(email);
        return ResponseEntity.ok(responses);
    }

    // Fetch logged-in user's complete KYC submission history
    @GetMapping("/my-history")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<List<MiscDTOs.KycResponse>> getMyKycHistory(Authentication authentication) {
        List<MiscDTOs.KycResponse> responses = miscService.getAllKycsByUserEmail(authentication.getName());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/admin/{kycId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MiscDTOs.KycResponse> updateKycStatus(
            @PathVariable Long kycId,
            @Valid @RequestBody MiscDTOs.KycUpdateStatusRequest request,
            Authentication authentication
    ) {
        MiscDTOs.KycResponse response = miscService.updateKycStatus(
                kycId,
                authentication.getName(),
                request.getStatus(),
                request.getRemarks()
        );
        return ResponseEntity.ok(response);
    }
}