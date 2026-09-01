package com.eAuction.backend.service;

import com.eAuction.backend.dto.AdminDTOs;
import com.eAuction.backend.entity.Admin;
import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.AdminRepository;
import com.eAuction.backend.security.JWTService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    @Override
    public AdminDTOs.AdminResponse createAdmin(AdminDTOs.AdminRegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        log.info("Creating new admin with email: {}", normalizedEmail);

        if (adminRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Admin already exists with email: " + normalizedEmail);
        }

        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(normalizedEmail);
        admin.setPassword(passwordEncoder.encode(request.getPassword()));

        Admin savedAdmin = adminRepository.save(admin);
        log.info("Admin created successfully with email: {}", savedAdmin.getEmail());

        return mapToAdminResponse(savedAdmin);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDTOs.AdminAuthResponse loginAdmin(AdminDTOs.AdminLoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        log.info("Attempting admin login for email: {}", normalizedEmail);

        Admin admin = adminRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            log.warn("Admin login failed. Invalid password for email: {}", normalizedEmail);
            throw new InvalidOperationException("Invalid email or password");
        }

        String token = jwtService.generateAdminAccessToken(admin);
        log.info("Admin logged in successfully with email: {}", admin.getEmail());

        return AdminDTOs.AdminAuthResponse.builder()
                .token(token)
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDTOs.AdminResponse getAdminByEmail(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        log.info("Fetching admin profile for email: {}", normalizedEmail);

        Admin admin = adminRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + normalizedEmail));

        return mapToAdminResponse(admin);
    }

    private AdminDTOs.AdminResponse mapToAdminResponse(Admin admin) {
        return AdminDTOs.AdminResponse.builder()
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }
}