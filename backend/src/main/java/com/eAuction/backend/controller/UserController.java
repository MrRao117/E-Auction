package com.eAuction.backend.controller;

import com.eAuction.backend.dto.AuthDTOs;
import com.eAuction.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    // Fetch logged-in user's own profile using JWT token directly
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthDTOs.UserResponse> getCurrentUserProfile(Authentication authentication) {
        AuthDTOs.UserResponse response = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(response);
    }

    // Admin-only email search feature
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthDTOs.UserResponse> getUserByEmail(@RequestParam String email) {
        AuthDTOs.UserResponse userResponse = userService.getUserByEmail(email);
        return ResponseEntity.ok(userResponse);
    }
}