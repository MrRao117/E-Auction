import axiosClient from "../axiosClient";

// ==========================================
// KYC SUBMISSION API
// ==========================================

// 1. Submit KYC details (BUYER only)
// POST /api/v1/kyc/submit
export const submitKyc = async (kycData) => {
  const response = await axiosClient.post("/kyc/submit", kycData);
  return response.data;
};

// ==========================================
// USER KYC APIs
// ==========================================

// 2. Get logged-in user's current KYC status
// GET /api/v1/kyc/my-status
// Access: BUYER, SELLER
export const getMyKycStatus = async () => {
  const response = await axiosClient.get("/kyc/my-status");
  return response.data;
};

// 3. Get logged-in user's complete KYC history
// GET /api/v1/kyc/my-history
// Access: BUYER, SELLER
export const getMyKycHistory = async () => {
  const response = await axiosClient.get("/kyc/my-history");
  return response.data;
};

// ==========================================
// ADMIN KYC APIs
// ==========================================

// 4. Get KYC records by verification status
// GET /api/v1/kyc/admin/status?status=PENDING
// Access: ADMIN
export const getKycByStatus = async (status = "PENDING") => {
  const response = await axiosClient.get("/kyc/admin/status", {
    params: { status },
  });
  return response.data;
};

// 5. Get complete KYC history for a user by email
// GET /api/v1/kyc/admin/user-history?email=user@example.com
// Access: ADMIN
export const getAllKycsByUserEmail = async (email) => {
  const response = await axiosClient.get("/kyc/admin/user-history", {
    params: { email },
  });
  return response.data;
};

// 6. Update KYC status (ADMIN only)
// PUT /api/v1/kyc/admin/{kycId}/status
export const updateKycStatus = async (kycId, updateData) => {
  const response = await axiosClient.put(
    `/kyc/admin/${kycId}/status`,
    updateData,
  );
  return response.data;
};
