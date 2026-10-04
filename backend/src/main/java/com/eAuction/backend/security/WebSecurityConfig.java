package com.eAuction.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final JWTAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String[] allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC AUTH, SWAGGER DOCS, TEST ROUTE, WEBSOCKETS & PAYMENT CALLBACK/WEBHOOK
                        .requestMatchers(
                                "/api/v1",                   // <--- Keeps your test/root endpoint accessible
                                "/api/v1/",                  // <--- Keeps trailing slash test path accessible
                                "/api/v1/auth/**",
                                "/v3/api-docs/**",           // <--- OpenAPI json docs
                                "/swagger-ui/**",            // <--- Swagger UI static assets
                                "/swagger-ui.html",          // <--- Swagger UI main endpoint
                                "/api/v1/admin/register",
                                "/api/v1/admin/login",
                                "/api/v1/payments/callback",
                                "/api/v1/payments/webhook",
                                "/ws-auction/**",            // <--- Allows WebSocket & SockJS handshakes
                                "/actuator/health",
                                "/actuator/prometheus"
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
                        .requestMatchers(HttpMethod.GET, "/api/v1/auction-registrations/public/count/**", "/api/v1/auction-registration/public/count/**").permitAll()
                        .requestMatchers("/api/v1/auction-registrations/admin/**", "/api/v1/auction-registration/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auction-registrations/**", "/api/v1/auction-registration/**").hasAnyRole("BUYER", "SELLER")

                        .requestMatchers(HttpMethod.GET, "/api/v1/bids/auction/**").permitAll()
                        .requestMatchers("/api/v1/bids/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/bids/**").hasAnyRole("BUYER", "SELLER")

                        .requestMatchers("/api/v1/orders/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/orders/**").hasAnyRole("BUYER", "SELLER", "ADMIN")

                        .requestMatchers("/api/v1/delivery-agents/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/deliveries/assign").hasRole("ADMIN")
                        .requestMatchers("/api/v1/deliveries/**").hasAnyRole("ADMIN", "BUYER", "SELLER")

                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/seller/**").hasRole("SELLER")

                        .requestMatchers("/actuator/**").hasRole("ADMIN")

                        // 8. CATCH-ALL
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "X-Razorpay-Signature"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
