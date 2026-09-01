package com.eAuction.backend.service;

import com.eAuction.backend.dto.AuthDTOs;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.UserRepository;
import com.eAuction.backend.security.JWTService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    @Override
    public AuthDTOs.UserResponse registerUser(AuthDTOs.RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("User with email " + normalizedEmail + " already exists!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDob(request.getDob());
        user.setGender(request.getGender());
        user.setMobileNo(request.getMobileNo());

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDTOs.AuthResponse loginUser(AuthDTOs.LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        log.info("Attempting login for email: {}", normalizedEmail);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateAccessToken(user);

        return AuthDTOs.AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .dob(user.getDob())
                .gender(user.getGender())
                .userRole(user.getUserRole())
                .mobileNo(user.getMobileNo())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthDTOs.UserResponse getUserByEmail(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        return mapToUserResponse(user);
    }

    private AuthDTOs.UserResponse mapToUserResponse(User user) {
        return AuthDTOs.UserResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .dob(user.getDob())
                .gender(user.getGender())
                .mobileNo(user.getMobileNo())
                .isVerified(user.getIsVerified())
                .build();
    }
}