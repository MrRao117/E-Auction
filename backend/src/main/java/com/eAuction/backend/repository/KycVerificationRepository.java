package com.eAuction.backend.repository;

import com.eAuction.backend.entity.KycVerification;
import com.eAuction.backend.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface KycVerificationRepository extends JpaRepository<KycVerification, Long> {

    List<KycVerification> findByUser_UserId(Long userId);

    Optional<KycVerification> findTopByUser_UserIdOrderBySubmittedAtDesc(Long userId);
    List<KycVerification> findByVerificationStatus(VerificationStatus verificationStatus);

    boolean existsByUser_UserIdAndVerificationStatus(Long userId, VerificationStatus verificationStatus);

    List<KycVerification> findByUser_UserIdOrderBySubmittedAtDesc(Long userId);
}