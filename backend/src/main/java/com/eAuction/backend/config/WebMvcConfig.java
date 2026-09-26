package com.eAuction.backend.config;

import com.eAuction.backend.security.RateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                // Protect bidding endpoints against bot spam
                .addPathPatterns("/api/v1/auctions/*/bids/**")
                // Protect login endpoints against brute-force attacks
                .addPathPatterns("/api/v1/auth/login");
    }
}