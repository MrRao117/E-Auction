package com.eAuction.backend.controller;

import com.eAuction.backend.dto.AddressDTOs;
import com.eAuction.backend.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // 1. Add new address for the authenticated user
    @PostMapping("/add")
    public ResponseEntity<AddressDTOs.AddressResponse> addAddress(
            @Valid @RequestBody AddressDTOs.CreateAddressRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AddressDTOs.AddressResponse response = addressService.addAddress(userEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. Fetch all addresses belonging to the authenticated user
    @GetMapping("/my-addresses")
    public ResponseEntity<List<AddressDTOs.AddressResponse>> getMyAddresses(Authentication authentication) {
        String userEmail = authentication.getName();
        List<AddressDTOs.AddressResponse> responses = addressService.getAddressesByUserEmail(userEmail);
        return ResponseEntity.ok(responses);
    }

    // 3. Admin Route: Fetch addresses by user email
    @GetMapping("/user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AddressDTOs.AddressResponse>> getAddressesByUserEmail(@RequestParam String email) {
        List<AddressDTOs.AddressResponse> responses = addressService.getAddressesByUserEmail(email);
        return ResponseEntity.ok(responses);
    }

    // 4. Get a specific address
    @GetMapping("/{addressId}")
    public ResponseEntity<AddressDTOs.AddressResponse> getAddressById(
            @PathVariable Long addressId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AddressDTOs.AddressResponse response = addressService.getAddressById(addressId, userEmail);
        return ResponseEntity.ok(response);
    }

    // 5. Update an existing address
    @PutMapping("/{addressId}/update")
    public ResponseEntity<AddressDTOs.AddressResponse> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressDTOs.CreateAddressRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AddressDTOs.AddressResponse response = addressService.updateAddress(addressId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    // 6. Delete an address
    @DeleteMapping("/{addressId}/delete")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        addressService.deleteAddress(addressId, userEmail);
        return ResponseEntity.noContent().build();
    }
}