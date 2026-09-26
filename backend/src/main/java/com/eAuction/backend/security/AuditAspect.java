package com.eAuction.backend.security;

import com.eAuction.backend.entity.AdminAuditLog;
import com.eAuction.backend.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AdminAuditLogRepository auditLogRepository;

    @Around("@annotation(auditable)")
    public Object auditAdminAction(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ANONYMOUS_ADMIN";

        String status = "SUCCESS";
        String details = "Executed successfully";
        Object result;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable ex) {
            status = "FAILED";
            details = "Exception: " + ex.getMessage();
            throw ex;
        } finally {
            try {
                AdminAuditLog auditLog = AdminAuditLog.builder()
                        .adminEmail(adminEmail)
                        .actionName(auditable.action())
                        .targetResource(auditable.target())
                        .status(status)
                        .details(details)
                        .build();
                auditLogRepository.save(auditLog);
            } catch (Exception dbEx) {
                log.error("Failed to persist admin audit log record: {}", dbEx.getMessage());
            }
        }
    }
}