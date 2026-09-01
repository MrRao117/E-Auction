package com.eAuction.backend.controller;

import com.eAuction.backend.dto.AuctionDTOs;
import com.eAuction.backend.service.AuctionRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auction-registration")
public class AuctionRegistrationController {

    private final AuctionRegistrationService auctionRegistrationService;

    @PostMapping("/register/{auctionId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<Void> registerForAuction(
            @PathVariable Long auctionId,
            Authentication authentication
    ) {
        auctionRegistrationService.registerForAuction(auctionId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/check/{auctionId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<Boolean> isUserRegistered(
            @PathVariable Long auctionId,
            Authentication authentication
    ) {
        boolean isRegistered = auctionRegistrationService.isUserRegisteredForAuction(authentication.getName(), auctionId);
        return ResponseEntity.ok(isRegistered);
    }

    @GetMapping("/my-registrations")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<List<AuctionDTOs.AuctionResponse>> getMyRegisteredAuctions(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                auctionRegistrationService.getRegisteredAuctionsForUser(authentication.getName())
        );
    }

    @GetMapping("/public/count/{auctionId}")
    public ResponseEntity<AuctionDTOs.RegistrationCountResponse> getRegistrationCount(@PathVariable Long auctionId) {
        long count = auctionRegistrationService.getRegistrationCountForAuction(auctionId);
        return ResponseEntity.ok(new AuctionDTOs.RegistrationCountResponse(auctionId, count));
    }

    @GetMapping("/admin/auction/{auctionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuctionDTOs.AuctionRegistrationDetailsResponse>> getRegistrationsForAuction(
            @PathVariable Long auctionId
    ) {
        return ResponseEntity.ok(auctionRegistrationService.getRegistrationsByAuctionId(auctionId));
    }
}