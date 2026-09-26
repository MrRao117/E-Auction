package com.eAuction.backend.advice;

import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.exception.UnauthorizedAccessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Helper method to construct unified ResponseEntity
    private <T> ResponseEntity<ApiResponse<T>> buildErrorResponse(HttpStatus status, String message, List<String> subErrors) {
        ApiError apiError = ApiError.builder()
                .status(status)
                .message(message)
                .subErrors(subErrors)
                .build();

        ApiResponse<T> response = new ApiResponse<>(apiError);
        return new ResponseEntity<>(response, status);
    }

    // 1. Handle Resource Not Found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // 2. Handle Invalid Operation / Business Rule Violation (400)
    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidOperationException(InvalidOperationException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // 3. Handle Duplicate Entity / Conflicts (409)
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateResourceException(DuplicateResourceException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    // 4. Handle Application-Level Unauthorized Access (403)
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedAccessException(UnauthorizedAccessException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), null);
    }

    // 5. NEW: Handle Spring Security Bad Credentials / Wrong Password (401)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password", null);
    }

    // 6. NEW: Handle Spring Security Access Denied / Insufficient Roles (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "You do not have permission to perform this action", null);
    }

    // 7. Handle DTO Jakarta Validation Errors (@Valid, @NotNull, @Positive) (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> validationErrors = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(error -> {
                    if (error instanceof FieldError fieldError) {
                        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
                    }
                    return error.getDefaultMessage();
                })
                .toList();

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation failed for input data", validationErrors);
    }

    // 8. Generic Fallback Handler for unexpected internal errors (500) - Sanitized
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex) {
        // Log the actual exception internally for troubleshooting
        log.error("Unhandled internal server error occurred", ex);

        // Return a clean, non-leaking message to the API caller
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal server error occurred. Please try again later.", null);
    }
}