package com.eAuction.backend.controller;

import com.eAuction.backend.dto.AdminDTOs;
import com.eAuction.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Secure Admin Registration: Only an existing logged-in ADMIN can create another admin account
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDTOs.AdminResponse> registerAdmin(
            @Valid @RequestBody AdminDTOs.AdminRegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAdmin(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AdminDTOs.AdminAuthResponse> loginAdmin(
            @Valid @RequestBody AdminDTOs.AdminLoginRequest request
    ) {
        return ResponseEntity.ok(adminService.loginAdmin(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDTOs.AdminResponse> getMyAdminProfile(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAdminByEmail(authentication.getName()));
    }
}