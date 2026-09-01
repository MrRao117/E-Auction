package com.eAuction.backend.dto;

import com.eAuction.backend.entity.enums.Gender;
import com.eAuction.backend.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

public class AuthDTOs {


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private String name;
        private String email;
        private LocalDate dob;
        private Gender gender;
        private String mobileNo;
        private Boolean isVerified;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least of 6 characters")
        private String password;

        private LocalDate dob;
        private Gender gender;

        @NotBlank(message = "Phone Number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile number is in invalid format")
        private String mobileNo;
    }


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private LocalDate dob;
        private Gender gender;
        private Role userRole;
        private String mobileNo;
    }
}
