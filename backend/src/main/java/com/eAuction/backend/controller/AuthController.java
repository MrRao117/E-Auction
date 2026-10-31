package com.eAuction.backend.controller;

import com.eAuction.backend.dto.AuthDTOs;
import com.eAuction.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTOs.UserResponse> registerUser(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        AuthDTOs.UserResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTOs.AuthResponse> loginUser(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        AuthDTOs.AuthResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody AuthDTOs.ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok("Password reset instructions sent successfully.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody AuthDTOs.ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}
