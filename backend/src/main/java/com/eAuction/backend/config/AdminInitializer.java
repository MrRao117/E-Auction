package com.eAuction.backend.config;

import com.eAuction.backend.entity.Admin;
import com.eAuction.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email:admin@eauction.com}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password:Admin@123456}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-name:Super Admin}")
    private String defaultAdminName;

    @Override
    @Transactional
    public void run(String... args) {
        String normalizedEmail = defaultAdminEmail.toLowerCase().trim();

        // Check if any Admin record exists in the database
        if (adminRepository.count() == 0) {
            log.info("No administrative account detected in database. Bootstrapping default admin user...");

            Admin admin = Admin.builder()
                    .name(defaultAdminName)
                    .email(normalizedEmail)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .build();

            adminRepository.save(admin);

            log.info("Default Admin account successfully created with email: {}", normalizedEmail);
            log.warn("IMPORTANT: Please change the default admin password upon initial login!");
        } else {
            log.info("Admin user check completed: Administrative account already exists.");
        }
    }
}