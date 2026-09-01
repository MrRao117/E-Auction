package com.eAuction.backend.security;

import com.eAuction.backend.dto.AuthDTOs;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        log.info("Attempting authentication for email: {}", request.getEmail());

        // This automatically verifies the password using PasswordEncoder
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Pass 'user' directly because User implements UserDetails
        String jwtToken = jwtService.generateRefreshToken(user);

        log.info("Authentication successful for email: {}", request.getEmail());

        return AuthDTOs.AuthResponse.builder()
                .token(jwtToken)
                .name(user.getName())
                .email(user.getEmail())
                .dob(user.getDob())
                .gender(user.getGender())
                .userRole(user.getUserRole())
                .mobileNo(user.getMobileNo())
                .build();
    }
}