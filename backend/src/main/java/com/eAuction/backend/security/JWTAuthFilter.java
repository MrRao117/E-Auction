package com.eAuction.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JWTAuthFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // ==============================
        // CHECK AUTHORIZATION HEADER
        // ==============================
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.info("No valid Authorization header found.");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {

            // ==============================
            // EXTRACT USER EMAIL
            // ==============================
            final String userEmail = jwtService.extractUsername(jwt);

            logger.info("JWT username/email: {}", userEmail);

            if (userEmail != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                // ==============================
                // LOAD USER FROM DATABASE
                // ==============================
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(userEmail);

                logger.info("Loaded user: {}", userDetails.getUsername());

                // ==============================
                // PRINT AUTHORITIES
                // ==============================
                logger.info(
                        "User authorities: {}",
                        userDetails.getAuthorities()
                );

                // ==============================
                // VALIDATE JWT
                // ==============================
                if (jwtService.isTokenValid(
                        jwt,
                        userDetails.getUsername()
                )) {

                    logger.info("JWT validation successful.");

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);

                    // ==============================
                    // PRINT FINAL SECURITY CONTEXT
                    // ==============================
                    logger.info(
                            "SecurityContext authentication: {}",
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
                    );

                    logger.info(
                            "Final authorities: {}",
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
                                    .getAuthorities()
                    );

                } else {
                    logger.warn("JWT validation failed.");
                }
            }

        } catch (Exception e) {

            logger.error(
                    "Could not set user authentication in security context",
                    e
            );
        }

        // Continue request
        filterChain.doFilter(request, response);
    }
}
