package com.eAuction.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter implements Filter {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    private static final String TRACE_ID_MDC_KEY = "traceId";

    // Strict validation: Alphanumeric, hyphens, and underscores only (1 to 64 chars).
    // Blocks malicious log injection (e.g. newlines, carriage returns, or format specifiers).
    private static final Pattern SAFE_TRACE_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9\\-_]{1,64}$");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientTraceId = httpRequest.getHeader(TRACE_ID_HEADER);
        String traceId;

        // Validate client-supplied trace ID or securely generate a clean UUID fallback
        if (clientTraceId != null && SAFE_TRACE_ID_PATTERN.matcher(clientTraceId).matches()) {
            traceId = clientTraceId;
        } else {
            traceId = UUID.randomUUID().toString().substring(0, 8);
        }

        MDC.put(TRACE_ID_MDC_KEY, traceId);
        httpResponse.setHeader(TRACE_ID_HEADER, traceId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(TRACE_ID_MDC_KEY);
        }
    }
}