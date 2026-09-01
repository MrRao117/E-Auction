package com.eAuction.backend.controller;

import com.eAuction.backend.dto.AuctionDTOs;
import com.eAuction.backend.dto.AuthDTOs;
import com.eAuction.backend.entity.enums.AuctionStatus;
import com.eAuction.backend.service.AuctionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<AuctionDTOs.AuctionResponse> createAuction(
            @Valid @RequestBody AuctionDTOs.CreateAuctionRequest request, Authentication authentication
            ){
        String sellerEmail = authentication.getName();
        return new ResponseEntity<>(auctionService.createAuction(request, sellerEmail), HttpStatus.CREATED);
    }


    @GetMapping("/my-auctions")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<AuctionDTOs.AuctionResponse>> getMyAuctions(Authentication authentication) {
        String sellerEmail = authentication.getName();
        return ResponseEntity.ok(auctionService.getAuctionsForLoggedInSeller(sellerEmail));
    }

    @PutMapping("/{auctionId}/cancel")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> cancelAuction(@PathVariable Long auctionId){
        auctionService.cancelAuction(auctionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<AuctionDTOs.AuctionResponse>> getAllAuctions(){
        return ResponseEntity.ok(auctionService.getAllAuctions());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AuctionDTOs.AuctionResponse>> getAuctionByStatus(@PathVariable AuctionStatus status){
        return ResponseEntity.ok(auctionService.getAuctionsByStatus(status));
    }

    // Controller (Admin Only)
    @GetMapping("/admin/seller")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuctionDTOs.AuctionResponse>> getAuctionsBySellerEmail(
            @RequestParam String email
    ) {
        List<AuctionDTOs.AuctionResponse> response = auctionService.getAuctionsBySellerEmailForAdmin(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionDTOs.AuctionResponse> getAuctionById(@PathVariable Long auctionId){
        return ResponseEntity.ok(auctionService.getAuctionById(auctionId));
    }

    @PutMapping("/{auctionId}/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuctionDTOs.AuctionResponse> updateAuctionStatus(@PathVariable Long auctionId, @RequestParam AuctionStatus status){
        return ResponseEntity.ok(auctionService.updateAuctionStatus(auctionId, status));
    }
}
