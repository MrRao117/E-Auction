package com.eAuction.backend.service;

import com.eAuction.backend.dto.MiscDTOs;
import com.eAuction.backend.entity.enums.VerificationStatus;

import java.util.List;

public interface MiscService {

    // KYC Operations
    MiscDTOs.KycResponse submitKyc(MiscDTOs.KycSubmissionRequest request, String userEmail);

    MiscDTOs.KycResponse getKycByUserEmail(String userEmail);

    List<MiscDTOs.KycResponse> getKycsByStatus(VerificationStatus status);

    List<MiscDTOs.KycResponse> getAllKycsByUserEmail(String userEmail);

    MiscDTOs.KycResponse updateKycStatus(Long kycId, String adminEmail, VerificationStatus status, String remarks);

    // Product Feedback Operations (Identity resolved via JWT email)
    void addProductFeedback(MiscDTOs.ProductFeedbackRequest request, String userEmail);

    List<MiscDTOs.ProductFeedbackResponse> getFeedbackForProduct(Long productId);
}