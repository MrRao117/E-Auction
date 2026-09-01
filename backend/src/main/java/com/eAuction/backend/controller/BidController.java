package com.eAuction.backend.controller;

import com.eAuction.backend.dto.BidDTOs;
import com.eAuction.backend.service.BidService;
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
@RequestMapping("/api/v1/bids")
public class BidController {

    private final BidService bidService;

    @PostMapping("/place/{auctionId}")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<BidDTOs.PublicBidResponse> placeBid(
            @PathVariable Long auctionId,
            @RequestBody @Valid BidDTOs.PlaceBidRequest request,
            Authentication authentication
    ) {
        String buyerEmail = authentication.getName();
        BidDTOs.PublicBidResponse response = bidService.placeBid(auctionId, buyerEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<BidDTOs.PublicBidResponse>> getBidsByAuctionId(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidsByAuctionId(auctionId));
    }

    @GetMapping("/auction/{auctionId}/highest")
    public ResponseEntity<BidDTOs.PublicBidResponse> getHighestBidForAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getHighestBidForAuction(auctionId));
    }

    @GetMapping("/my-bids")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<List<BidDTOs.MyBidResponse>> getMyBids(Authentication authentication) {
        String buyerEmail = authentication.getName();
        return ResponseEntity.ok(bidService.getBidsByBuyerEmail(buyerEmail));
    }

    //ADMIN ONLY: Retrieve complete bid history for auditing
    @GetMapping("/admin/auction/{auctionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BidDTOs.AdminBidResponse>> getFullBidsForAdmin(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getFullBidsForAdmin(auctionId));
    }

    // Total bid count for an active auction
    @GetMapping("/auction/{auctionId}/count")
    public ResponseEntity<Long> getBidCountForAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidCountForAuction(auctionId));
    }

    //BUYER ONLY: Check if current user is winning an auction
    @GetMapping("/auction/{auctionId}/is-highest-bidder")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<Boolean> isCurrentUserHighestBidder(
            @PathVariable Long auctionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bidService.isUserHighestBidder(auctionId, authentication.getName()));
    }
}