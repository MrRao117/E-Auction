package com.eAuction.backend.service;

import com.eAuction.backend.dto.AuthDTOs;

public interface UserService {

    AuthDTOs.UserResponse registerUser(AuthDTOs.RegisterRequest request);

    AuthDTOs.AuthResponse loginUser(AuthDTOs.LoginRequest request);

    AuthDTOs.UserResponse getUserByEmail(String name);
}