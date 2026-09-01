package com.eAuction.backend.service;

import com.eAuction.backend.dto.AdminDTOs;
import org.springframework.transaction.annotation.Transactional;

public interface AdminService {

    AdminDTOs.AdminResponse createAdmin(AdminDTOs.AdminRegisterRequest request);

    AdminDTOs.AdminAuthResponse loginAdmin(AdminDTOs.AdminLoginRequest request);

    AdminDTOs.AdminResponse getAdminByEmail(String email);
}