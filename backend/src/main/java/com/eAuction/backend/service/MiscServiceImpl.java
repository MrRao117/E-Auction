package com.eAuction.backend.service;

import com.eAuction.backend.dto.MiscDTOs;
import com.eAuction.backend.entity.*;
import com.eAuction.backend.entity.enums.Role;
import com.eAuction.backend.entity.enums.VerificationStatus;
import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.InvalidOperationException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MiscServiceImpl implements MiscService {

    private final KycVerificationRepository kycRepository;
    private final ProductFeedbackRepository productFeedbackRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final ProductRepository productRepository;

    @Override
    public MiscDTOs.KycResponse submitKyc(MiscDTOs.KycSubmissionRequest request, String userEmail) {
        String normalizedEmail = userEmail.toLowerCase().trim();
        log.info("Submitting KYC for user email: {}", normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        if (kycRepository.existsByUser_UserIdAndVerificationStatus(user.getUserId(), VerificationStatus.PENDING)) {
            throw new InvalidOperationException("You already have a PENDING KYC verification request.");
        }

        KycVerification kyc = new KycVerification();
        kyc.setUser(user);
        kyc.setDocumentType(request.getDocumentType());
        kyc.setRemarks(request.getRemarks());
        kyc.setVerificationStatus(VerificationStatus.PENDING);
        kyc.setSubmittedAt(LocalDateTime.now());
        kyc.setVerifiedAt(null);

        KycVerification savedKyc = kycRepository.save(kyc);
        log.info("KYC submission created with ID: {}", savedKyc.getKycId());

        return mapToKycResponse(savedKyc);
    }

    @Override
    @Transactional(readOnly = true)
    public MiscDTOs.KycResponse getKycByUserEmail(String userEmail) {
        String normalizedEmail = userEmail.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        KycVerification kyc = kycRepository.findTopByUser_UserIdOrderBySubmittedAtDesc(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("No KYC record found for user email: " + normalizedEmail));

        return mapToKycResponse(kyc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MiscDTOs.KycResponse> getKycsByStatus(VerificationStatus status) {
        return kycRepository.findByVerificationStatus(status).stream()
                .map(this::mapToKycResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MiscDTOs.KycResponse> getAllKycsByUserEmail(String userEmail) {
        String normalizedEmail = userEmail.toLowerCase().trim();
        log.info("Fetching all KYC records for user email: {}", normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        return kycRepository.findByUser_UserIdOrderBySubmittedAtDesc(user.getUserId()).stream()
                .map(this::mapToKycResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MiscDTOs.KycResponse updateKycStatus(Long kycId, String adminEmail, VerificationStatus status, String remarks) {
        String normalizedAdminEmail = adminEmail.toLowerCase().trim();
        log.info("Admin Email {} updating KYC ID {} to status: {}", normalizedAdminEmail, kycId, status);

        KycVerification kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC record not found with id: " + kycId));

        Admin admin = adminRepository.findByEmail(normalizedAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + normalizedAdminEmail));

        kyc.setAdmin(admin);
        kyc.setVerificationStatus(status);
        kyc.setVerifiedAt(LocalDateTime.now());

        if (status == VerificationStatus.VERIFIED) {
            User user = kyc.getUser();
            user.setUserRole(Role.SELLER);
            user.setIsVerified(true);
            userRepository.save(user);
            log.info("User email {} promoted from BUYER to SELLER role upon KYC approval.", user.getEmail());
        } else if (status == VerificationStatus.REJECTED) {
            User user = kyc.getUser();
            user.setUserRole(Role.BUYER);
            user.setIsVerified(false);
            userRepository.save(user);
        }

        if (remarks != null && !remarks.isBlank()) {
            kyc.setRemarks(remarks);
        }

        KycVerification updatedKyc = kycRepository.save(kyc);
        return mapToKycResponse(updatedKyc);
    }

    @Override
    public void addProductFeedback(MiscDTOs.ProductFeedbackRequest request, String userEmail) {
        String normalizedEmail = userEmail.toLowerCase().trim();
        log.info("Adding feedback for product ID: {} by user email: {}", request.getProductId(), normalizedEmail);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        if (productFeedbackRepository.existsByProduct_ProductIdAndUser_UserId(request.getProductId(), user.getUserId())) {
            throw new DuplicateResourceException("You have already provided feedback for this product.");
        }

        ProductFeedback feedback = new ProductFeedback();
        feedback.setProduct(product);
        feedback.setUser(user);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        productFeedbackRepository.save(feedback);
        log.info("Product feedback saved successfully.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<MiscDTOs.ProductFeedbackResponse> getFeedbackForProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return productFeedbackRepository.findByProduct_ProductId(productId).stream()
                .map(pf -> MiscDTOs.ProductFeedbackResponse.builder()
                        .productId(pf.getProduct().getProductId())
                        .userEmail(pf.getUser() != null ? pf.getUser().getEmail() : null)
                        .rating(pf.getRating())
                        .comment(pf.getComment())
                        .build())
                .collect(Collectors.toList());
    }

    private MiscDTOs.KycResponse mapToKycResponse(KycVerification kyc) {
        return MiscDTOs.KycResponse.builder()
                .kycId(kyc.getKycId())
                .userEmail(kyc.getUser() != null ? kyc.getUser().getEmail() : null)
                .documentType(kyc.getDocumentType())
                .verificationStatus(kyc.getVerificationStatus())
                .remarks(kyc.getRemarks())
                .submittedAt(kyc.getSubmittedAt())
                .verifiedAt(kyc.getVerifiedAt())
                .build();
    }
}