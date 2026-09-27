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
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    // No hardcoded fallbacks here anymore!
    @Value("${app.admin.default-email:}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password:}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-name:Super Admin}")
    private String defaultAdminName;

    @Override
    @Transactional
    public void run(String... args) {
        // Fail fast if the environment variables are missing
        if (!StringUtils.hasText(defaultAdminEmail) || !StringUtils.hasText(defaultAdminPassword)) {
            throw new IllegalStateException(
                    "CRITICAL SECURITY ERROR: Default admin credentials are not configured! " +
                            "Please set APP_ADMIN_DEFAULT_EMAIL and APP_ADMIN_DEFAULT_PASSWORD environment variables."
            );
        }

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
        } else {
            log.info("Admin user check completed: Administrative account already exists.");
        }
    }
}