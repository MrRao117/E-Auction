package com.eAuction.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final JWTAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC AUTH, SWAGGER DOCS & PAYMENT CALLBACK
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/v1/admin/register",
                                "/api/v1/admin/login",
                                "/api/v1/payments/callback"
                        ).permitAll()

                        // 2. PRODUCT & CATEGORY PUBLIC READS
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()

                        // 3. AUCTION SPECIFIC RULES
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auctions/**").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auctions/*/cancel").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auctions/*/status/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/auctions/**").hasRole("ADMIN")

                        // 4. CATEGORY & PRODUCT WRITE OPERATIONS
                        .requestMatchers(HttpMethod.POST, "/api/v1/products/categories/**").hasAnyRole("ADMIN", "SELLER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/products/**").hasRole("SELLER")

                        // 5. KYC ENDPOINTS
                        .requestMatchers("/api/v1/kyc/submit", "/api/v1/kyc/user/**").hasAnyRole("BUYER", "SELLER")
                        .requestMatchers("/api/v1/kyc/my-status").authenticated()
                        .requestMatchers("/api/v1/kyc/admin/**").hasRole("ADMIN")

                        // 6. ADDRESS ENDPOINTS
                        .requestMatchers("/api/v1/addresses/user").hasRole("ADMIN")
                        .requestMatchers("/api/v1/addresses/**").hasAnyRole("BUYER", "SELLER", "ADMIN")

                        // 7. GENERAL ROLE-BASED MATCHERS
                        // 7.1 Auction registration endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-registration/public/count/**").permitAll()
                        .requestMatchers("/api/v1/auction-registration/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auction-registrations/**").hasAnyRole("BUYER", "SELLER")

                        // 7.2 FOR BIDS
                        .requestMatchers(HttpMethod.GET, "/api/v1/bids/auction/**").permitAll()
                        .requestMatchers("/api/v1/bids/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/bids/**").hasAnyRole("BUYER", "SELLER")

                        // 7.3 ORDER ENDPOINTS
                        .requestMatchers("/api/v1/orders/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/orders/**").hasAnyRole("BUYER", "SELLER", "ADMIN")

                        // 7.4 DELIVERY AGENTS & DELIVERIES (ADDED HERE)
                        .requestMatchers("/api/v1/delivery-agents/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/deliveries/assign").hasRole("ADMIN")
                        .requestMatchers("/api/v1/deliveries/**").hasAnyRole("ADMIN", "BUYER", "SELLER")

                        // General
                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/seller/**").hasRole("SELLER")

                        // 8. CATCH-ALL FOR ANY UNMAPPED ENDPOINT
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}